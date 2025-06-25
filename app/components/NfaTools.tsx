import { useState } from "react";
import NFASimulator from "./NFASimulator";
import NfaToDfaConverter from "./NFAtoDFA";
import Link from "next/link";

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

export default function NfaTools() {
  const [selectedTool, setSelectedTool] = useState<"simulator" | "create" | "dfa" | null>(null);

  if (selectedTool === "simulator") {
    return (
      <div>
        <BackButton onClick={() => setSelectedTool(null)} />
        <NFASimulator />
      </div>
    );
  }

  if (selectedTool === "create") {
    return (
      <div>
        <BackButton onClick={() => setSelectedTool(null)} />
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-gray-300">
          <h3 className="text-xl font-semibold mb-3">NFA Constructor</h3>
          <p>Construct a NFA (coming soon).</p>
        </div>
      </div>
    );
  }

  if (selectedTool === "dfa") {
    return (
      <div>
        <BackButton onClick={() => setSelectedTool(null)} />
        <NfaToDfaConverter />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {/* Simulate NFA Card */}
      <div
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700"
        onClick={() => setSelectedTool("simulator")}
      >
        <h3 className="text-xl font-semibold mb-3">Simulate NFA</h3>
        <p className="text-gray-300 mb-4">
          Upload or input an NFA and step through its execution on any string.
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
      {/* Create NFA Card */}
      <div
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700"
        onClick={() => setSelectedTool("create")}
      >
        <h3 className="text-xl font-semibold mb-3">NFA Constructor</h3>
        <p className="text-gray-300 mb-4">Construct a NFA (coming soon).</p>
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
      {/* NFA to DFA Card */}
      <div
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700"
        onClick={() => setSelectedTool("dfa")}
      >
        <h3 className="text-xl font-semibold mb-3">NFA to DFA</h3>
        <p className="text-gray-300 mb-4">
          Convert your NFA to an equivalent DFA (coming soon).
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
  );
} 