'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLinkClick = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-700 focus:outline-none"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className={`block w-full h-0.5 bg-white transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-full h-0.5 bg-white ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-full h-0.5 bg-white transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 shadow-lg md:hidden z-50">
          <div className="py-2">
            <button onClick={() => handleLinkClick('/')} className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 border-b border-gray-700">Home</button>
            <button onClick={() => handleLinkClick('/nfa')} className="w-full text-left px-4 py-2 text-white hover:bg-gray-700">NFA</button>
            <button onClick={() => handleLinkClick('/dfa')} className="w-full text-left px-4 py-2 text-white hover:bg-gray-700">DFA</button>
            <button onClick={() => handleLinkClick('/pda')} className="w-full text-left px-4 py-2 text-white hover:bg-gray-700">PDA</button>
            <button onClick={() => handleLinkClick('/cfg')} className="w-full text-left px-4 py-2 text-white hover:bg-gray-700">CFG</button>
            <button onClick={() => handleLinkClick('/regex')} className="w-full text-left px-4 py-2 text-white hover:bg-gray-700">Regex</button>
          </div>
        </div>
      )}
    </div>
  )
} 