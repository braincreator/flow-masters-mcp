import type { ServiceRegistry } from '@/services/service.registry' // Import ServiceRegistry

// Try augmenting 'payload' directly
declare module 'payload' {
  // Augment the existing Payload interface
  export interface Payload {
    services?: ServiceRegistry;
  }

  export interface GlobalConfig {
    slug: string
    label: string
    access: Record<string, unknown>
    admin: {
      group?: string
      components?: {
        views?: {
          edit?: () => Promise<{ Component: React.ComponentType, path: string }>
        }
      }
    }
    hooks: Record<string, unknown>
    fields: unknown[]
  }

  export type GlobalBeforeValidateHook = (args: { data: any }) => any
  export type BeforeValidateHook = GlobalBeforeValidateHook
  export function deepMerge(...objs: any[]): any
}