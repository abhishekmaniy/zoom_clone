import { Toaster } from '@/components/ui/toaster'
import StreamVideoProvider from '@/providers/StreamClientProvider'
import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'YOOM',
  description: 'Video Calling App',
  icons:'icons/logo.svg'
}

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <StreamVideoProvider>{children}
      <Toaster />

      </StreamVideoProvider>
    </main>
  )
}

export default RootLayout
