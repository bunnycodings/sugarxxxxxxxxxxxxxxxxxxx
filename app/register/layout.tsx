import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account at Sugarbunny Stores',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

