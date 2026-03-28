import { ExpressAdapter } from '@bull-board/express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { Queue } from 'bullmq'
import * as jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { getRedisConnectionOptions } from 'src/common/queue/utils'
import Redis from 'ioredis'

const prisma = new PrismaClient()

export function setupBullBoard(server: any) {
  // create server adapter and attach queues
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  getRedisConnectionOptions(REDIS_URL).then((connectionOptions) => {
    const connection = new Redis((connectionOptions as any).url, {
      maxRetriesPerRequest: null,
      tls: (connectionOptions as any).tls,
    })
    const bookingQueue = new Queue('booking:postprocess', { connection })
    createBullBoard({ queues: [new BullMQAdapter(bookingQueue)], serverAdapter })
  })

  // admin auth middleware using JWT + DB role check
  const adminAuth = async (req: any, res: any, next: any) => {
    try {
      // Accept either Authorization: Bearer <token> or cookie named 'accessToken' or 'next-auth.session-token'
      let token: string | undefined
      const authHeader = req.headers.authorization
      if (authHeader) {
        const parts = authHeader.split(' ')
        if (parts[0] === 'Bearer') token = parts[1]
      }

      if (!token && req.headers.cookie) {
        const cookies = Object.fromEntries(
          req.headers.cookie.split(';').map((c: string) => {
            const [k, ...v] = c.split('=')
            return [k.trim(), decodeURIComponent(v.join('='))]
          }),
        )
        token = 
          cookies['accessToken'] || 
          cookies['__Secure-next-auth.session-token'] || 
          cookies['next-auth.session-token'] || 
          cookies['nextAuthToken']
      }

      if (!token) return res.status(401).send('Token required')

      const secret = process.env.JWT_SECRET
      if (!secret) return res.status(500).send('Server misconfigured')

  const payload: any = jwt.verify(token, secret)
      const uid = payload?.uid
      if (!uid) return res.status(401).send('Invalid token')

      // check admin role in DB
      const admin = await prisma.admin.findUnique({ where: { uid } })
      if (!admin) return res.status(403).send('Forbidden')

      // attached user info for downstream if needed
      req.user = { uid, roles: ['admin'] }
      return next()
    } catch (err: any) {
      console.warn('Admin auth failed for bull board', err.message || err)
      return res.status(401).send('Unauthorized')
    }
  }

  // mount with adminAuth
  server.use('/admin/queues', adminAuth, serverAdapter.getRouter())
}

export default setupBullBoard
