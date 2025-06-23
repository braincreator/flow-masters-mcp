// FlowMasters AI Agents - Type Definitions
// Generated with AI assistance for rapid development

export interface AgentRequest {
  message: string
  context?: AgentContext
  history?: Message[]
  userId?: string
  sessionId?: string
}

export interface AgentResponse {
  type: AgentResponseType
  content: string
  data?: any
  sources?: Source[]
  suggestions?: string[]
  actions?: AgentAction[]
  metadata?: ResponseMetadata
}

export interface AgentContext {
  userProfile?: UserProfile
  currentPage?: string
  previousInteractions?: Interaction[]
  preferences?: UserPreferences
  businessContext?: BusinessContext
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: MessageMetadata
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  company?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  language: 'ru' | 'en'
  theme: 'light' | 'dark'
  notifications: boolean
  aiAssistanceLevel: 'basic' | 'advanced' | 'expert'
}

export interface BusinessContext {
  industry?: string
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  useCases?: string[]
  integrations?: string[]
}

export interface Source {
  id: string
  title: string
  url?: string
  excerpt: string
  relevanceScore: number
  type: 'documentation' | 'tutorial' | 'faq' | 'api-reference'
}

export interface AgentAction {
  type: 'navigate' | 'create_workflow' | 'open_documentation' | 'schedule_demo'
  label: string
  data: any
}

export interface Interaction {
  id: string
  agentType: AgentType
  query: string
  response: string
  timestamp: Date
  satisfaction?: number
  feedback?: string
}

export interface ResponseMetadata {
  processingTime: number
  tokensUsed: number
  confidence: number
  sources: number
}

export interface MessageMetadata {
  agentType?: AgentType
  processingTime?: number
  sources?: Source[]
}

export type AgentType = 'assistant' | 'search' | 'automation' | 'multimodal' | 'analytics' | 'support'

export type AgentResponseType = 
  | 'text' 
  | 'search_results' 
  | 'workflow_template' 
  | 'documentation' 
  | 'error'

// Search specific types
export interface SearchQuery {
  query: string
  filters?: SearchFilters
  limit?: number
  threshold?: number
}

export interface SearchFilters {
  type?: string[]
  dateRange?: DateRange
  source?: string[]
  language?: string
}

export interface DateRange {
  from: Date
  to: Date
}

export interface SearchResult {
  id: string
  title: string
  content: string
  url?: string
  score: number
  metadata: SearchMetadata
}

export interface SearchMetadata {
  type: string
  source: string
  lastUpdated: Date
  tags: string[]
}

// Automation specific types
export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  triggers: WorkflowTrigger[]
  actions: WorkflowAction[]
  variables: WorkflowVariable[]
}

export interface WorkflowTrigger {
  type: string
  name: string
  description: string
  config: any
}

export interface WorkflowAction {
  type: string
  name: string
  description: string
  config: any
}

export interface WorkflowVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object'
  description: string
  required: boolean
  defaultValue?: any
}

// Error types
export interface AgentError {
  code: string
  message: string
  details?: any
  timestamp: Date
  agentType?: AgentType
  userId?: string
}

// Configuration types
export interface AgentConfig {
  agentType: AgentType
  name: string
  description: string
  enabled: boolean
  maxTokens: number
  temperature: number
  systemPrompt: string
  capabilities: string[]
  integrations: IntegrationConfig[]
}

export interface IntegrationConfig {
  service: string
  endpoint: string
  apiKey?: string
  enabled: boolean
  config: any
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: AgentError
  metadata?: {
    requestId: string
    timestamp: Date
    processingTime: number
  }
}