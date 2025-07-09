"use client";
import NfaTools from '../components/NfaTools';

export default function FAPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">NFA Tools</h1>
        <p className="text-gray-300 mb-8">
          Explore our collection of tools for working with Non-deterministic Finite Automata. Simulate, create, and convert automata with interactive visualizations and step-by-step execution.
        </p>
        <NfaTools />
      </div>
    </main>
  );
} 