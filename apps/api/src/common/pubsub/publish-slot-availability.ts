import { PubSub } from 'graphql-subscriptions'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { SLOT_AVAILABILITY_CHANGED } from 'src/models/garages/graphql/garages.resolver'

export async function publishSlotAvailability(
    pubSub: PubSub,
    prisma: PrismaService,
    garageId: number,
    startTime: Date,
    endTime: Date,
) {
    const groupBySlots = await prisma.slot.groupBy({
        by: ['type'],
        _count: { type: true },
        _min: { pricePerHour: true },
        where: {
            garageId,
            Bookings: {
                none: {
                    startTime: { lt: endTime },
                    endTime: { gt: startTime },
                },
            },
        },
    })

    const availableSlots = groupBySlots.map(({ _count, type, _min }) => ({
        type,
        count: _count.type,
        pricePerHour: _min.pricePerHour,
    }))

    await pubSub.publish(SLOT_AVAILABILITY_CHANGED, {
        [SLOT_AVAILABILITY_CHANGED]: { garageId, availableSlots },
    })
}
