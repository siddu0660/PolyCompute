export default function PDA() {
  return (
    <main className="min-h-screen bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Pushdown Automata (PDA)</h1>
        
        <div className="max-w-3xl">
          <p className="text-lg text-gray-300 mb-6">
            Welcome to the Pushdown Automata section. This area will feature tools and resources for 
            working with PDAs, including simulation, conversion.
          </p>
          
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>PDA Simulator</li>
              <li>CFG to PDA Converter</li>
              <li>PDA to CFG Converter</li>
              <li>NFA to PDA Converter</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
} 