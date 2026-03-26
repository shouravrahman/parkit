import {
  Dialog as HDialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { IconX } from '@tabler/icons-react'
import { Fragment, ReactNode } from 'react'

export type IDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  widthClassName?: string
  children: ReactNode
}

export const Dialog = ({
  open,
  setOpen,
  title,
  widthClassName = 'max-w-md',
  children,
}: IDialogProps) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <HDialog
        as="div"
        className="relative z-50"
        onClose={() => setOpen(false)}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={`w-full ${widthClassName} rounded-2xl border border-white/10 bg-dark-100 p-6 shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-lg font-semibold text-white">
                  {title}
                </DialogTitle>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </HDialog>
    </Transition>
  )
}
