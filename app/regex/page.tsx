import RegexTools from '../components/RegexTools'

export default function RegexPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Regular Expression Tools</h1>
        <p className="text-gray-300 mb-8">
          Explore our collection of tools for working with regular expressions. 
          Test patterns, convert to automata, and learn about regex theory.
        </p>
        <RegexTools />
      </div>
    </main>
  )
} 