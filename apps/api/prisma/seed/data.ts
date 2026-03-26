import { generateSlots } from './util'
import { Prisma } from '@prisma/client'

const CLOUDINARY_IMAGE_URL = 'https://res.cloudinary.com/dm8f8amsl/image/upload/v1774556259/pexels-margarita-k-105195494-35981310_oh1yum.jpg'

export const garagesSample: Prisma.GarageCreateInput[] = [
  {
    displayName: 'Manhattan Garage 1',
    description: 'Secure parking in the heart of Manhattan',
    Company: { connect: { id: 1 } },
    images: {
      set: [
        'https://res.cloudinary.com/dm8f8amsl/image/upload/v1774556259/pexels-margarita-k-105195494-35981310_oh1yum.jpg',
      ],
    },

    Address: {
      create: {
        address: '123 5th Ave, New York, NY 10001',
        lat: 40.712776,
        lng: -74.005974,
      },
    },
    Slots: {
      create: [
        ...generateSlots({
          type: 'BIKE',
        }),
        ...generateSlots({
          type: 'CAR',
        }),
      ],
    },
  },
]
export const garages: Prisma.GarageCreateInput[] = [
  {
    displayName: 'Brooklyn Garage 1',
    description: 'Affordable parking in Brooklyn',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'BICYCLE',
        }),
      ],
    },
    Address: {
      create: {
        address: '456 Court St, Brooklyn, NY 11231',
        lat: 40.678178,
        lng: -73.944158,
      },
    },
  },
  {
    displayName: 'Queens Garage 1',
    description: 'Convenient parking in Queens',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'CAR',
        }),
      ],
    },
    Address: {
      create: {
        address: '789 Queens Blvd, Queens, NY 11373',
        lat: 40.728224,
        lng: -73.794852,
      },
    },
  },
  {
    displayName: 'Manhattan Garage 2',
    description: 'Secure parking near Central Park',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'BICYCLE',
        }),

        ...generateSlots({
          type: 'CAR',
        }),
      ],
    },
    Address: {
      create: {
        address: '101 Central Park West, New York, NY 10023',
        lat: 40.7812,
        lng: -73.9665,
      },
    },
  },
  {
    displayName: 'Brooklyn Garage 2',
    description: 'Spacious parking in Brooklyn Heights',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'BIKE',
        }),
      ],
    },
    Address: {
      create: {
        address: '202 Atlantic Ave, Brooklyn, NY 11201',
        lat: 40.6912,
        lng: -73.9936,
      },
    },
  },
  {
    displayName: 'Queens Garage 2',
    description: 'Safe parking in Flushing',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'BICYCLE',
        }),
        ...generateSlots({
          type: 'BIKE',
        }),
        ...generateSlots({
          type: 'CAR',
        }),
      ],
    },
    Address: {
      create: {
        address: '303 Main St, Flushing, NY 11354',
        lat: 40.759,
        lng: -73.8303,
      },
    },
  },
  {
    displayName: 'Manhattan Garage 3',
    description: 'Parking near Times Square',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'BIKE',
        }),
      ],
    },
    Address: {
      create: {
        address: '1515 Broadway, New York, NY 10036',
        lat: 40.758,
        lng: -73.9855,
      },
    },
  },
  {
    displayName: 'Brooklyn Garage 3',
    description: 'Secure parking in Williamsburg',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'CAR',
        }),
      ],
    },
    Address: {
      create: {
        address: '404 Bedford Ave, Brooklyn, NY 11249',
        lat: 40.7081,
        lng: -73.9571,
      },
    },
  },
  {
    displayName: 'Queens Garage 3',
    description: 'Affordable parking in Astoria',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'CAR',
        }),
      ],
    },
    Address: {
      create: {
        address: '505 Steinway St, Astoria, NY 11103',
        lat: 40.7592,
        lng: -73.9196,
      },
    },
  },
  {
    displayName: 'Manhattan Garage 4',
    description: 'Parking near Wall Street',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'BICYCLE',
        }),

        ...generateSlots({
          type: 'CAR',
        }),
      ],
    },
    Address: {
      create: {
        address: '75 Wall St, New York, NY 10005',
        lat: 40.7074,
        lng: -74.0104,
      },
    },
  },
  {
    displayName: 'Brooklyn Garage 4',
    description: 'Parking near Prospect Park',
    Company: { connect: { id: 1 } },
    images: { set: [CLOUDINARY_IMAGE_URL] },
    Slots: {
      create: [
        ...generateSlots({
          type: 'BICYCLE',
        }),
        ...generateSlots({
          type: 'BIKE',
        }),
        ...generateSlots({
          type: 'CAR',
        }),
      ],
    },
    Address: {
      create: {
        address: '606 Flatbush Ave, Brooklyn, NY 11225',
        lat: 40.6591,
        lng: -73.9626,
      },
    },
  },
]
