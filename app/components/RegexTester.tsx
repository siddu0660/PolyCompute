'use client'

import { useState, useEffect } from 'react'

interface RegexPattern {
  name: string
  pattern: string
}

export default function RegexTester() {
  const [patterns, setPatterns] = useState<RegexPattern[]>([])
  const [newPattern, setNewPattern] = useState('')
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [alphabet, setAlphabet] = useState<string[]>([])
  const [selectedChars, setSelectedChars] = useState({
    lowercase: true,
    uppercase: true,
    digits: true,
    ascii: false
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [testString, setTestString] = useState('')
  const [testResult, setTestResult] = useState<{ [key: number]: boolean }>({})

  const updateAlphabet = () => {
    const newAlphabet: string[] = []
    if (selectedChars.lowercase) {
      newAlphabet.push(...'abcdefghijklmnopqrstuvwxyz'.split(''))
    }
    if (selectedChars.uppercase) {
      newAlphabet.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))
    }
    if (selectedChars.digits) {
      newAlphabet.push(...'0123456789'.split(''))
    }
    if (selectedChars.ascii) {
      // Add ASCII characters except special ones
      for (let i = 32; i <= 126; i++) {
        const char = String.fromCharCode(i)
        if (!['|', '*', '(', ')'].includes(char)) {
          newAlphabet.push(char)
        }
      }
    }
    setAlphabet(newAlphabet)
  }

  // Initialize alphabet when component mounts
  useEffect(() => {
    updateAlphabet()
  }, [])

  // Update alphabet when selectedChars changes
  useEffect(() => {
    updateAlphabet()
  }, [selectedChars])

  const validateRegex = (pattern: string): boolean => {
    // Check for balanced parentheses
    let stack = 0
    for (let char of pattern) {
      if (char === '(') stack++
      if (char === ')') stack--
      if (stack < 0) return false
    }
    if (stack !== 0) return false

    // Check for valid characters
    const validChars = new Set(alphabet)
    validChars.add('|') // Union
    validChars.add('*') // Kleene star
    validChars.add('(')
    validChars.add(')')

    // Debug log
    console.log('Valid characters:', Array.from(validChars))
    console.log('Pattern:', pattern)
    console.log('Invalid characters:', Array.from(pattern).filter(char => !validChars.has(char)))

    for (let char of pattern) {
      if (!validChars.has(char)) {
        console.log('Invalid character found:', char)
        return false
      }
    }

    return true
  }

  const handleAddPattern = () => {
    if (!newPattern || !newName) {
      setError('Please provide both name and pattern')
      return
    }

    if (!validateRegex(newPattern)) {
      setError('Invalid regex pattern. Check parentheses and characters.')
      return
    }

    if (editingIndex !== null) {
      // Update existing pattern
      const updatedPatterns = [...patterns]
      updatedPatterns[editingIndex] = { name: newName, pattern: newPattern }
      setPatterns(updatedPatterns)
      setEditingIndex(null)
    } else {
      // Add new pattern
      setPatterns([...patterns, { name: newName, pattern: newPattern }])
    }

    setNewPattern('')
    setNewName('')
    setError('')
  }

  const handleEdit = (index: number) => {
    const pattern = patterns[index]
    setNewName(pattern.name)
    setNewPattern(pattern.pattern)
    setEditingIndex(index)
  }

  const handleDelete = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index));
  }

  const handleTestString = () => {
    if (!testString) {
      setError('Please enter a string to test')
      return
    }

    const results: { [key: number]: boolean } = {}
    patterns.forEach((pattern, index) => {
      try {
        // Convert our regex format to JavaScript regex format
        const jsRegex = pattern.pattern
          .replace(/\|/g, '|')  // Keep | as is
          .replace(/\*/g, '*')  // Keep * as is
        const regex = new RegExp(`^${jsRegex}$`)
        results[index] = regex.test(testString)
      } catch (e) {
        results[index] = false
      }
    })
    setTestResult(results)
  }

  return (
    <div className="space-y-6">
      {/* Alphabet Selection */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Select Alphabet</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedChars.lowercase}
              onChange={(e) => {
                setSelectedChars({ ...selectedChars, lowercase: e.target.checked })
                updateAlphabet()
              }}
              className="form-checkbox"
            />
            <span>Lowercase Letters (a-z)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedChars.uppercase}
              onChange={(e) => {
                setSelectedChars({ ...selectedChars, uppercase: e.target.checked })
                updateAlphabet()
              }}
              className="form-checkbox"
            />
            <span>Uppercase Letters (A-Z)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedChars.digits}
              onChange={(e) => {
                setSelectedChars({ ...selectedChars, digits: e.target.checked })
                updateAlphabet()
              }}
              className="form-checkbox"
            />
            <span>Digits (0-9)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedChars.ascii}
              onChange={(e) => {
                setSelectedChars({ ...selectedChars, ascii: e.target.checked })
                updateAlphabet()
              }}
              className="form-checkbox"
            />
            <span>Other ASCII Characters</span>
          </label>
        </div>
      </div>

      {/* Pattern Input */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          {editingIndex !== null ? 'Edit Pattern' : 'Add New Pattern'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pattern Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-md text-white"
              placeholder="Enter pattern name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Regex Pattern</label>
            <input
              type="text"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-md text-white"
              placeholder="Enter regex pattern (use | for union, * for Kleene star)"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex space-x-2">
            <button
              onClick={handleAddPattern}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingIndex !== null ? 'Update Pattern' : 'Add Pattern'}
            </button>
            {editingIndex !== null && (
              <button
                onClick={() => {
                  setEditingIndex(null)
                  setNewPattern('')
                  setNewName('')
                  setError('')
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* String Testing */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Test String</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Input String</label>
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-md text-white"
              placeholder="Enter string to test"
            />
          </div>
          <button
            onClick={handleTestString}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Test String
          </button>
        </div>
      </div>

      {/* Pattern List */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Saved Patterns</h3>
        {patterns.length === 0 ? (
          <p className="text-gray-400">No patterns added yet</p>
        ) : (
          <div className="space-y-2">
            {patterns.map((pattern, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">{pattern.name}:</span>
                    <span className="ml-2 text-gray-300">{pattern.pattern}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {testString && testResult[index] !== undefined && (
                  <div className={`text-sm ${testResult[index] ? 'text-green-400' : 'text-red-400'}`}>
                    Test Result: {testResult[index] ? 'Matches' : 'Does not match'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 