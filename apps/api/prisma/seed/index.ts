import { PrismaClient } from '@prisma/client'
import { garages } from './data'
import * as bcrypt from 'bcryptjs'

let prisma: PrismaClient

async function main() {
  prisma = new PrismaClient()

  const email = 'parkitadmin@parkit.com'
  const password = email
  const hashedPassword = await bcrypt.hash(password, 10)
  const uid = 'parkit-admin-uid'

  console.log('Seeding admin user...')
  await prisma.user.upsert({
    where: { uid },
    update: {},
    create: {
      uid,
      name: 'Parkit Admin',
      Credentials: {
        create: {
          email,
          passwordHash: hashedPassword,
        },
      },
      Admin: {
        create: {},
      },
    },
  })

  console.log('Seeding default company...')
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        displayName: 'Parkit Primary',
        description: 'The primary company for the Parkit platform.',
      },
    }),
    prisma.company.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        displayName: 'Elite Valet Services',
        description: 'Premium valet solutions for high-end venues.',
      },
    }),
    prisma.company.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        displayName: 'Global Parking Solutions',
        description: 'Large scale parking management.',
      },
    }),
  ])

  const managerData = [
    { email: 'parkitmanager@parkit.com', name: 'Primary Manager', companyId: 1, uid: 'parkit-manager-uid' },
    { email: 'elite@parkit.com', name: 'Elite Manager', companyId: 2, uid: 'elite-manager-uid' },
    { email: 'global@parkit.com', name: 'Global Manager', companyId: 3, uid: 'global-manager-uid' },
  ]

  for (const m of managerData) {
    const hashedPassword = await bcrypt.hash(m.email, 10)
    console.log(`Seeding manager ${m.email}...`)
    await prisma.user.upsert({
      where: { uid: m.uid },
      update: {},
      create: {
        uid: m.uid,
        name: m.name,
        Credentials: {
          create: {
            email: m.email,
            passwordHash: hashedPassword,
          },
        },
        Manager: {
          create: {
            displayName: m.name,
            companyId: m.companyId,
          },
        },
      },
    })
  }

  const valetData = [
    { email: 'valet1@parkit.com', name: 'Valet 1', companyId: 1, uid: 'valet-1-uid' },
    { email: 'valet2@parkit.com', name: 'Valet 2', companyId: 2, uid: 'valet-2-uid' },
    { email: 'valet3@parkit.com', name: 'Valet 3', companyId: 3, uid: 'valet-3-uid' },
  ]

  for (const v of valetData) {
    const hashedPassword = await bcrypt.hash(v.email, 10)
    console.log(`Seeding valet ${v.email}...`)
    await prisma.user.upsert({
      where: { uid: v.uid },
      update: {},
      create: {
        uid: v.uid,
        name: v.name,
        Credentials: {
          create: {
            email: v.email,
            passwordHash: hashedPassword,
          },
        },
        Valet: {
          create: {
            displayName: v.name,
            companyId: v.companyId,
          },
        },
      },
    })
  }

  console.log('Seeding garages...')
  for (let i = 0; i < garages.length; i++) {
    const garage = garages[i]
    // Distribute garages across the 3 companies
    const assignedCompanyId = (i % 3) + 1
    await prisma.garage.create({
      data: {
        ...garage,
        Company: { connect: { id: assignedCompanyId } },
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
