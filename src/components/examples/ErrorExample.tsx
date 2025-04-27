'use client'

import React, { useState } from 'react'
import { 
  useError,
  useErrorCapture,
  useErrorState,
  useErrorManagement,
  useTryCatch,
  ErrorBoundary
} from '@/hooks/useContexts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Trash2, 
  RefreshCw,
  Bug,
  Wifi,
  ShieldAlert,
  FileWarning,
  Undo,
  Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// Error-prone component that will crash
function ErrorProneComponent({ shouldError = false }) {
  if (shouldError) {
    throw new Error('This component crashed intentionally!')
  }
  
  return (
    <div className="p-4 border rounded bg-green-50 text-green-800">
      <p className="font-medium">Component is working correctly</p>
      <p className="text-sm">No errors were thrown</p>
    </div>
  )
}

// Error boundary fallback component
function ErrorFallback({ error, reset }: { error: any; reset: () => void }) {
  return (
    <div className="p-4 border border-red-500 rounded bg-red-50 text-red-800">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <Bug className="h-5 w-5" />
        Component Error
      </h3>
      <p className="mb-4">{error.message}</p>
      <Button 
        variant="destructive" 
        onClick={reset}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  )
}

// Error list component
function ErrorList() {
  const { errors } = useErrorState()
  const { clearError, clearAllErrors, recoverFromError } = useErrorManagement()
  
  // Get icon based on error severity
  const getErrorIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-700" />
      case 'error':
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }
  
  // Get icon based on error category
  const getErrorCategoryIcon = (category: string) => {
    switch (category) {
      case 'network':
        return <Wifi className="h-4 w-4" />
      case 'permission':
        return <ShieldAlert className="h-4 w-4" />
      case 'validation':
        return <FileWarning className="h-4 w-4" />
      case 'rendering':
        return <Bug className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Errors ({errors.length})</h3>
        {errors.length > 0 && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={clearAllErrors}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>
      
      {errors.length > 0 ? (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {errors.map((error) => (
            <div key={error.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getErrorIcon(error.severity)}
                  <span className="font-medium">{error.message}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => recoverFromError(error.id)}
                    className="h-8 w-8 p-0"
                    title="Recover"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => clearError(error.id)}
                    className="h-8 w-8 p-0"
                    title="Dismiss"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getErrorCategoryIcon(error.category)}
                  {error.category}
                </Badge>
                <Badge 
                  variant={
                    error.severity === 'critical' 
                      ? 'destructive' 
                      : error.severity === 'warning' 
                        ? 'warning' 
                        : error.severity === 'info' 
                          ? 'info' 
                          : 'secondary'
                  }
                >
                  {error.severity}
                </Badge>
                {error.code && (
                  <Badge variant="outline" className="font-mono">
                    {error.code}
                  </Badge>
                )}
                <Badge variant={error.handled ? 'success' : 'outline'}>
                  {error.handled ? 'Handled' : 'Unhandled'}
                </Badge>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(error.timestamp).toLocaleString()}
              </div>
              
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer">
                    Stack Trace
                  </summary>
                  <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-[100px]">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No errors captured yet</p>
          <p className="text-sm mt-1">Try generating some errors in the "Generate Errors" tab</p>
        </div>
      )}
    </div>
  )
}

// Error generator component
function ErrorGenerator() {
  const { captureError } = useErrorCapture()
  const [tryCatchResult, setTryCatchResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const tryCatch = useTryCatch()
  
  // Error generation options
  const [errorMessage, setErrorMessage] = useState('Something went wrong')
  const [errorSeverity, setErrorSeverity] = useState('error')
  const [errorCategory, setErrorCategory] = useState('unknown')
  const [errorCode, setErrorCode] = useState('ERR_001')
  
  // Generate a basic error
  const handleGenerateError = () => {
    captureError(errorMessage, {
      severity: errorSeverity as any,
      category: errorCategory as any,
      code: errorCode,
      context: {
        source: 'ErrorGenerator',
        timestamp: new Date().toISOString(),
      },
    })
  }
  
  // Generate a network error
  const handleGenerateNetworkError = () => {
    captureError('Failed to fetch data from API', {
      severity: 'error',
      category: 'network',
      code: 'NET_ERR_001',
      context: {
        url: 'https://api.example.com/data',
        method: 'GET',
        statusCode: 500,
      },
    })
  }
  
  // Generate a permission error
  const handleGeneratePermissionError = () => {
    captureError('You do not have permission to access this resource', {
      severity: 'warning',
      category: 'permission',
      code: 'PERM_ERR_001',
      context: {
        resource: 'admin-dashboard',
        requiredRole: 'admin',
        userRole: 'user',
      },
    })
  }
  
  // Generate a validation error
  const handleGenerateValidationError = () => {
    captureError('Validation failed for the submitted form', {
      severity: 'info',
      category: 'validation',
      code: 'VAL_ERR_001',
      context: {
        form: 'user-registration',
        fields: {
          email: 'Invalid email format',
          password: 'Password must be at least 8 characters',
        },
      },
    })
  }
  
  // Test try-catch wrapper
  const handleTestTryCatch = async () => {
    setIsLoading(true)
    setTryCatchResult(null)
    
    // Simulate async operation that might fail
    const [result, error] = await tryCatch(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Randomly succeed or fail
        if (Math.random() > 0.5) {
          return 'Operation completed successfully!'
        } else {
          throw new Error('Operation failed with a random error')
        }
      },
      {
        severity: 'warning',
        category: 'api',
        context: { operation: 'test-try-catch' },
      }
    )
    
    setIsLoading(false)
    
    if (result) {
      setTryCatchResult(result)
      toast.success('Operation succeeded', {
        description: result,
      })
    } else if (error) {
      setTryCatchResult(`Failed: ${error.message}`)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Custom Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="error-message">Error Message</Label>
              <Input
                id="error-message"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Enter error message"
              />
            </div>
            
            <div>
              <Label htmlFor="error-severity">Severity</Label>
              <Select value={errorSeverity} onValueChange={setErrorSeverity}>
                <SelectTrigger id="error-severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="error-category">Category</Label>
              <Select value={errorCategory} onValueChange={setErrorCategory}>
                <SelectTrigger id="error-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="permission">Permission</SelectItem>
                  <SelectItem value="rendering">Rendering</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="error-code">Error Code (optional)</Label>
              <Input
                id="error-code"
                value={errorCode}
                onChange={(e) => setErrorCode(e.target.value)}
                placeholder="e.g., ERR_001"
              />
            </div>
            
            <Button onClick={handleGenerateError} className="w-full">
              Generate Error
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Predefined Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleGenerateNetworkError}
              className="w-full flex items-center justify-start gap-2"
            >
              <Wifi className="h-4 w-4" />
              Network Error
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGeneratePermissionError}
              className="w-full flex items-center justify-start gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              Permission Error
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGenerateValidationError}
              className="w-full flex items-center justify-start gap-2"
            >
              <FileWarning className="h-4 w-4" />
              Validation Error
            </Button>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Try-Catch Wrapper</Label>
              <Button 
                variant="default" 
                onClick={handleTestTryCatch}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Test Try-Catch'
                )}
              </Button>
              
              {tryCatchResult && (
                <div className={`p-2 rounded text-sm ${
                  tryCatchResult.startsWith('Failed') 
                    ? 'bg-red-50 text-red-800' 
                    : 'bg-green-50 text-green-800'
                }`}>
                  {tryCatchResult}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Error Boundary Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Error boundaries catch errors during rendering and display a fallback UI.
              Click the button below to trigger an error in the component.
            </p>
            
            <ErrorBoundary fallback={ErrorFallback}>
              <div className="space-y-2">
                <ErrorProneComponent shouldError={false} />
                
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    // Force re-render with error
                    const component = document.getElementById('error-component')
                    if (component) {
                      component.innerHTML = ''
                      const newComponent = document.createElement('div')
                      component.appendChild(newComponent)
                      React.render(<ErrorProneComponent shouldError={true} />, newComponent)
                    }
                  }}
                >
                  Trigger Component Error
                </Button>
              </div>
            </ErrorBoundary>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main example component
export function ErrorExample() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Error Provider Example</CardTitle>
        <CardDescription>
          This component demonstrates how to use the ErrorProvider for centralized error handling
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="errors">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="errors">Error List</TabsTrigger>
            <TabsTrigger value="generate">Generate Errors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="errors">
            <ErrorList />
          </TabsContent>
          
          <TabsContent value="generate">
            <ErrorGenerator />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Using selector hooks for better performance: useErrorCapture, useErrorState, useErrorManagement, useTryCatch
        </p>
      </CardFooter>
    </Card>
  )
}
