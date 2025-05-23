import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MilestonesProvider, useMilestones } from '@/providers/MilestonesProvider'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/use-toast'

// Mock dependencies
jest.mock('@/hooks/useAuth')
jest.mock('@/components/ui/use-toast')
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockToast = toast as jest.MockedFunction<typeof toast>

// Mock fetch
global.fetch = jest.fn()

// Test component that uses the provider
function TestComponent() {
  const { milestones, isLoading, createMilestone } = useMilestones()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="count">{milestones.length}</div>
      <button 
        onClick={() => createMilestone('test-project', {
          title: 'Test Milestone',
          priority: 'medium'
        })}
        data-testid="create-button"
      >
        Create
      </button>
    </div>
  )
}

describe('MilestonesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      refreshAuth: jest.fn(),
    })
  })

  it('should provide milestone context', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response)

    render(
      <MilestonesProvider projectId="test-project">
        <TestComponent />
      </MilestonesProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })
    
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('should handle milestone creation', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response)

    // Mock create milestone
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'milestone-1',
        title: 'Test Milestone',
        priority: 'medium',
        status: 'not_started',
        progress: 0,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    } as Response)

    render(
      <MilestonesProvider projectId="test-project">
        <TestComponent />
      </MilestonesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    // Click create button
    screen.getByTestId('create-button').click()

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'notifications.created',
        description: 'Test Milestone',
      })
    })
  })

  it('should handle errors gracefully', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <MilestonesProvider projectId="test-project">
        <TestComponent />
      </MilestonesProvider>
    )

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'notifications.error',
        description: 'Network error',
        variant: 'destructive',
      })
    })
  })

  it('should validate dependencies correctly', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'milestone-1',
          title: 'Milestone 1',
          dependencies: ['milestone-2'],
        },
        {
          id: 'milestone-2',
          title: 'Milestone 2',
          dependencies: [],
        },
      ],
    } as Response)

    function ValidationTestComponent() {
      const { validateDependencies } = useMilestones()
      
      return (
        <div>
          <div data-testid="valid">
            {validateDependencies('milestone-3', ['milestone-1']).toString()}
          </div>
          <div data-testid="circular">
            {validateDependencies('milestone-2', ['milestone-1']).toString()}
          </div>
        </div>
      )
    }

    render(
      <MilestonesProvider projectId="test-project">
        <ValidationTestComponent />
      </MilestonesProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('valid')).toHaveTextContent('true')
      expect(screen.getByTestId('circular')).toHaveTextContent('false')
    })
  })
})
