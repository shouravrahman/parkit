'use client'
import { CarScene } from '@parkit/3d/src/scenes/CarScene'
import { RotatingCamera } from '@parkit/3d/src/components/camera/Rotating'
import { IconArrowBack } from '@tabler/icons-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { BrandIcon } from '../atoms/BrandIcon'
import { GoogleButton } from './GoogleButton'

export interface IAuthLayoutProps {
  children: ReactNode
  title: string
}

export const AuthLayout = ({ title, children }: IAuthLayoutProps) => {
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <CarScene
        orbitControls={false}
        camera={<RotatingCamera />}
        hideAllComments
      />
      <div className="flex flex-col justify-center items-center absolute top-0 bg-black/50 backdrop-blur-sm bottom-0 left-0 right-0">
        <div className="p-6 text-white w-full max-w-lg mx-auto bg-dark-100/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <h1 className="flex items-center gap-2 mb-4 text-2xl font-display font-bold">
            <BrandIcon />
            <span className="text-gradient">{title}</span>
          </h1>
          {children}
          <div className="mt-6 text-sm text-gray-400">
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-3 w-full mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500">or continue with</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <GoogleButton />
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <IconArrowBack className="w-4 h-4" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
