import { useState } from "react";
import { NFA, State, Transition } from "./NFATypes";
import NFADiagram from "./NFADiagram";

export default function NFAConstructor() {
  const [states, setStates] = useState<State[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [alphabet, setAlphabet] = useState<string[]>([]);
  const [stateName, setStateName] = useState("");
  const [transition, setTransition] = useState({ from: "", to: "", symbol: "" });
  const [initialState, setInitialState] = useState<string | null>(null);
  const [finalStates, setFinalStates] = useState<string[]>([]);
  const [alphabetInput, setAlphabetInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Add a new state
  function handleAddState() {
    if (!stateName.trim()) return;
    if (states.some(s => s.id === stateName.trim())) {
      setError("State name must be unique.");
      return;
    }
    setStates([
      ...states,
      {
        id: stateName.trim(),
        label: stateName.trim(),
        isInitial: false,
        isFinal: false,
      },
    ]);
    setStateName("");
    setError(null);
  }

  // Add a new transition
  function handleAddTransition() {
    if (!transition.from || !transition.to || !transition.symbol) return;
    setTransitions([
      ...transitions,
      {
        from: transition.from,
        to: transition.to,
        symbol: transition.symbol,
      },
    ]);
    setTransition({ from: "", to: "", symbol: "" });
    setError(null);
  }

  // Add alphabet symbols
  function handleAddAlphabet() {
    const symbols = alphabetInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s && !alphabet.includes(s));
    setAlphabet([...alphabet, ...symbols]);
    setAlphabetInput("");
  }

  // Set initial state
  function handleSetInitialState(id: string) {
    setInitialState(id);
    setStates(states.map(s => ({ ...s, isInitial: s.id === id })));
  }

  // Toggle final state
  function handleToggleFinalState(id: string) {
    let newFinalStates: string[];
    if (finalStates.includes(id)) {
      newFinalStates = finalStates.filter(f => f !== id);
    } else {
      newFinalStates = [...finalStates, id];
    }
    setFinalStates(newFinalStates);
    setStates(states.map(s => ({ ...s, isFinal: newFinalStates.includes(s.id) })));
  }

  // Build NFA object
  const nfa: NFA | null =
    states.length > 0 && initialState
      ? {
          states,
          transitions,
          alphabet,
        }
      : null;

  // Download NFA as .nfa file
  function handleDownloadNfa() {
    if (!nfa) return;
    const blob = new Blob([JSON.stringify({ nfa }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nfa.nfa";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-gray-800/60 rounded-xl shadow-lg p-6 md:p-10 text-gray-200 mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
        NFA Constructor
      </h2>
      <p className="text-gray-400 mb-6">
        Build your own NFA by adding states, transitions, and alphabet symbols. Mark the initial and final states, and visualize your automaton below.
      </p>

      {error && (
        <div className="bg-red-900/60 text-red-200 p-4 rounded-md mb-4 border border-red-700 font-semibold">
          {error}
        </div>
      )}

      {/* Alphabet Input */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-300">Alphabet (comma separated):</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={alphabetInput}
            onChange={e => setAlphabetInput(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-gray-200"
            placeholder="e.g. a, b"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
            onClick={handleAddAlphabet}
            type="button"
          >
            Add
          </button>
          <button
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded font-semibold"
            type="button"
            onClick={() => {
              if (!alphabet.includes("ε")) setAlphabet([...alphabet, "ε"]);
            }}
            title="Add epsilon (ε) symbol"
          >
            Add ε
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {alphabet.map(sym => (
            <span key={sym} className="bg-blue-800/60 px-2 py-1 rounded text-blue-200 text-sm">{sym}</span>
          ))}
        </div>
      </div>

      {/* State Input */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-300">Add State:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={stateName}
            onChange={e => setStateName(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-gray-200"
            placeholder="State name (e.g. q0)"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
            onClick={handleAddState}
            type="button"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {states.map(s => (
            <div key={s.id} className="flex items-center gap-2 bg-gray-800/60 px-2 py-1 rounded">
              <span className="text-gray-100">{s.label}</span>
              <button
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  initialState === s.id
                    ? "bg-blue-700 text-white"
                    : "bg-gray-700 text-blue-200 hover:bg-blue-800"
                }`}
                onClick={() => handleSetInitialState(s.id)}
                type="button"
              >
                {initialState === s.id ? "Initial" : "Set Initial"}
              </button>
              <button
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  finalStates.includes(s.id)
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-green-200 hover:bg-green-800"
                }`}
                onClick={() => handleToggleFinalState(s.id)}
                type="button"
              >
                {finalStates.includes(s.id) ? "Final" : "Toggle Final"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transition Input */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-300">Add Transition:</label>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={transition.from}
            onChange={e => setTransition({ ...transition, from: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-gray-200"
          >
            <option value="">From</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <select
            value={transition.symbol}
            onChange={e => setTransition({ ...transition, symbol: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-gray-200"
          >
            <option value="">Symbol</option>
            {alphabet.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
          <select
            value={transition.to}
            onChange={e => setTransition({ ...transition, to: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-gray-200"
          >
            <option value="">To</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
            onClick={handleAddTransition}
            type="button"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {transitions.map((t, i) => (
            <div key={i} className="text-sm text-gray-300">
              δ({t.from}, {t.symbol}) → {t.to}
            </div>
          ))}
        </div>
      </div>

      {/* NFA Diagram */}
      <div className="mt-8">
        <h4 className="font-semibold mb-2 text-blue-300">NFA Diagram</h4>
        {nfa ? (
          <>
            <NFADiagram nfa={nfa} />
            <button
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 mt-4 rounded font-semibold transition-colors"
              onClick={handleDownloadNfa}
              type="button"
            >
              Download NFA (.nfa)
            </button>
          </>
        ) : (
          <div className="text-gray-500">Add states, transitions, and set initial/final states to see your NFA.</div>
        )}
      </div>
    </div>
  );
}
