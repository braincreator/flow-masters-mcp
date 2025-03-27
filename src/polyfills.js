// Polyfills for Node.js modules in browser environment
import { Buffer as _Buffer } from 'buffer'
import process from 'process'

// Make Buffer available globally
window.Buffer = _Buffer
window.process = process

// Other polyfills may be added as needed
