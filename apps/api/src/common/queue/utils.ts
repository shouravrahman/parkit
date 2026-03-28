import { lookup } from 'node:dns/promises'
import { URL } from 'node:url'

export async function getRedisConnectionOptions(redisUrl: string) {
  let finalRedisUrl = redisUrl

  if (redisUrl.includes('upstash.io') || redisUrl.includes('upstash.com')) {
    try {
      const url = new URL(redisUrl)
      const { address } = await lookup(url.hostname)
      url.hostname = address
      finalRedisUrl = url.toString()
      console.log('Bypassing BullMQ Upstash check by using IP:', address)
    } catch (err) {
      console.warn('Failed to resolve Upstash hostname, falling back to original URL', err)
    }
  }

  const connectionOptions = finalRedisUrl.startsWith('rediss://')
    ? { url: finalRedisUrl, tls: {} }
    : { url: finalRedisUrl }

  return connectionOptions
}
