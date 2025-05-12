import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import HamburgerMenu from './components/HamburgerMenu'
import LoadingBuffer from './components/LoadingBuffer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PolyCompute'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoadingBuffer />
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">PolyCompute</Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              <Link href="/nfa" className="hover:text-blue-400 transition-colors">NFA</Link>
              <Link href="/dfa" className="hover:text-blue-400 transition-colors">DFA</Link>
              <Link href="/pda" className="hover:text-blue-400 transition-colors">PDA</Link>
              <Link href="/cfg" className="hover:text-blue-400 transition-colors">CFG</Link>
              <Link href="/regex" className="hover:text-blue-400 transition-colors">Regex</Link>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <HamburgerMenu />
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} PolyCompute. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
