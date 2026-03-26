'use client'
import { CarScene } from '@parkit/3d/src/scenes/CarScene'
import { IconSearch } from '@tabler/icons-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative h-[calc(100vh-4rem)]">
      {/* full-bleed 3D scene fixed to viewport under the header */}
      <div className="fixed top-16 bottom-0 left-0 right-0 z-0">
        <CarScene />
      </div>

      {/* Overlay content: responsive sizes and proper stacking — placed inside Container so it aligns with header */}
      <div className="relative z-20 px-6 py-8 max-w-screen-md">
        <div className="flex flex-col items-start space-y-2 font-black text-5xl sm:text-7xl md:text-8xl">
          <div className="inline-block px-3 bg-primary text-black mt-2">Need</div>
          <div className="inline-block w-full max-w-md px-3 bg-primary text-black">parking?</div>
          <Link
            href="/search"
            className="flex items-center gap-2 px-3 py-2 text-lg sm:text-xl font-medium text-black underline underline-offset-4 bg-primary"
          >
            <IconSearch /> Search now
          </Link>
        </div>
      </div>
    </main>
  )
}
