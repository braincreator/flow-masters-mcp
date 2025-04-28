import { AuthConfig } from 'payload/config'

// Set a very long expiration time (100 years in seconds)
// This effectively makes the session "infinite"
const HUNDRED_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 100

export const authConfig: Partial<AuthConfig> = {
  tokenExpiration: HUNDRED_YEARS_IN_SECONDS,
  maxLoginAttempts: 5,
  lockTime: 600 * 1000, // 10 minutes
}
