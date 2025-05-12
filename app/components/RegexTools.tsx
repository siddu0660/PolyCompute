'use client'

import { useState } from 'react'
import RegexTester from './RegexTester'
import RegexToNFA from './RegexToNFA'

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center text-gray-300 hover:text-white transition-colors mb-4"
  >
    <svg 
      className="w-5 h-5 mr-2" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 19l-7-7 7-7" 
      />
    </svg>
    Back to Tools
  </button>
)

export default function RegexTools() {
  const [selectedTool, setSelectedTool] = useState<'pattern-tester' | 'nfa-converter' | null>(null)

  if (selectedTool === 'pattern-tester') {
    return (
      <div>
        <BackButton onClick={() => setSelectedTool(null)} />
        <RegexTester />
      </div>
    )
  }

  if (selectedTool === 'nfa-converter') {
    return (
      <div>
        <BackButton onClick={() => setSelectedTool(null)} />
        <RegexToNFA />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Regex Pattern Tester Card */}
      <div 
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700"
        onClick={() => setSelectedTool('pattern-tester')}
      >
        <h3 className="text-xl font-semibold mb-3">Regex Pattern Tester</h3>
        <p className="text-gray-300 mb-4">
          Test and validate regular expressions with our interactive pattern tester. 
          Create, edit, and test patterns against input strings.
        </p>
        <div className="flex items-center text-blue-400">
          <span>Open Tool</span>
          <svg 
            className="w-5 h-5 ml-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      </div>

      {/* Regex to NFA Converter Card */}
      <div 
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700"
        onClick={() => setSelectedTool('nfa-converter')}
      >
        <h3 className="text-xl font-semibold mb-3">Regex to NFA Converter</h3>
        <p className="text-gray-300 mb-4">
          Convert regular expressions to Non-deterministic Finite Automata (NFA). 
          Visualize the automaton and understand the conversion process.
        </p>
        <div className="flex items-center text-blue-400">
          <span>Open Tool</span>
          <svg 
            className="w-5 h-5 ml-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      </div>
    </div>
  )
} 