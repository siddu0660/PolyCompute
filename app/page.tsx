import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            PolyCompute
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore and analyze various computational theory concepts.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* NFA Card */}
          <Link href="/nfa" className="group">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 h-full">
              <h2 className="text-2xl font-bold mb-4 text-blue-400 group-hover:text-blue-300">NFA Analysis</h2>
              <p className="text-gray-300">Analyze and visualize Non-deterministic Finite Automata.</p>
            </div>
          </Link>

          {/* DFA Card */}
          <Link href="/dfa" className="group">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 h-full">
              <h2 className="text-2xl font-bold mb-4 text-green-400 group-hover:text-green-300">DFA Analysis</h2>
              <p className="text-gray-300">Work with Deterministic Finite Automata.</p>
            </div>
          </Link>

          {/* PDA Card */}
          <Link href="/pda" className="group">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 h-full">
              <h2 className="text-2xl font-bold mb-4 text-purple-400 group-hover:text-purple-300">PDA Analysis</h2>
              <p className="text-gray-300">Explore Pushdown Automata and their relationship with context-free languages.</p>
            </div>
          </Link>

          {/* CFG Card */}
          <Link href="/cfg" className="group">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 h-full">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400 group-hover:text-yellow-300">CFG Analysis</h2>
              <p className="text-gray-300">Analyze and validate Context-Free Grammars.</p>
            </div>
          </Link>

          {/* Regex Card */}
          <Link href="/regex" className="group">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300 h-full">
              <h2 className="text-2xl font-bold mb-4 text-red-400 group-hover:text-red-300">Regex Analysis</h2>
              <p className="text-gray-300">Test and visualize Regular Expressions.</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
