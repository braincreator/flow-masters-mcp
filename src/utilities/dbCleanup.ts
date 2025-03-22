import { Payload } from 'payload'

const connections = new WeakSet()
const timeouts = new Map()

export const cleanupConnection = async (payload: Payload) => {
  if (connections.has(payload)) {
    return
  }

  const timeoutId = setTimeout(async () => {
    try {
      await payload.db?.disconnect()
      connections.delete(payload)
    } catch (error) {
      console.error('Error cleaning up connection:', error)
    }
  }, 5000) // 5 second timeout

  timeouts.set(payload, timeoutId)
  connections.add(payload)
}

export const cancelCleanup = (payload: Payload) => {
  const timeoutId = timeouts.get(payload)
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeouts.delete(payload)
  }
}