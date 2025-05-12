'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function LoadingBuffer() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleEnd = () => setIsLoading(false)

    window.addEventListener('beforeunload', handleStart)
    window.addEventListener('load', handleEnd)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
      window.removeEventListener('load', handleEnd)
    }
  }, [])

  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50 md:hidden">
      <div className="h-full bg-blue-500 animate-loading-bar" />
    </div>
  )
} 