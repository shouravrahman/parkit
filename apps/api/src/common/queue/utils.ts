import { lookup } from 'node:dns/promises'
import { URL } from 'node:url'

export async function getRedisConnectionOptions(redisUrl: string) {
  let finalRedisUrl = redisUrl
  let tlsConfig: any = undefined

  if (redisUrl.includes('upstash.io') || redisUrl.includes('upstash.com')) {
    // Upstash requires TLS connection
    finalRedisUrl = finalRedisUrl.replace(/^redis:\/\//, 'rediss://')
    try {
      const url = new URL(finalRedisUrl)
      const { address } = await lookup(url.hostname)
      url.hostname = address
      finalRedisUrl = url.toString()
      console.log('Bypassing BullMQ Upstash check by using IP:', address)
      // Since we connect via IP, the certificate hostname won't match. We must disable strict validation.
      tlsConfig = { rejectUnauthorized: false }
    } catch (err) {
      console.warn('Failed to resolve Upstash hostname, falling back to original URL', err)
    }
  }

  if (finalRedisUrl.startsWith('rediss://') && !tlsConfig) {
    tlsConfig = {} // Default TLS if it's already rediss:// and not Upstash IP bypass
  }

  const connectionOptions = tlsConfig
    ? { url: finalRedisUrl, tls: tlsConfig }
    : { url: finalRedisUrl }

  return connectionOptions
}
