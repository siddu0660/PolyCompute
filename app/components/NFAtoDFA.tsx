import { useState } from "react";
import { NFA, State, Transition } from "./NFATypes";
import NFADiagram from "./NFADiagram";

// DFA type compatible with your NFA structure
type DFA = {
  states: State[];
  transitions: Transition[];
  alphabet: string[];
  initialState: string;
  finalStates: string[];
};

// Helper: Compute epsilon closure for a set of NFA state ids
function epsilonClosure(nfa: NFA, stateIds: Set<string>): Set<string> {
  const closure = new Set(stateIds);
  const stack = [...stateIds];
  while (stack.length > 0) {
    const state = stack.pop()!;
    for (const t of nfa.transitions) {
      if (t.from === state && t.symbol === "ε" && !closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    }
  }
  return closure;
}

// Helper: Move from a set of states on a symbol (without epsilon)
function move(nfa: NFA, stateIds: Set<string>, symbol: string): Set<string> {
  const result = new Set<string>();
  for (const state of stateIds) {
    for (const t of nfa.transitions) {
      if (t.from === state && t.symbol === symbol) {
        result.add(t.to);
      }
    }
  }
  return result;
}

// Main NFA to DFA conversion
function nfaToDfa(nfa: NFA): DFA {
  const nfaAlphabet = nfa.alphabet.filter((a) => a !== "ε");
  const dfaStates: { [key: string]: Set<string> } = {};
  const dfaTransitions: Transition[] = [];
  const stateNameMap: { [key: string]: string } = {}; // Map from set key to eX name
  let eqCounter = 1;

  // Helper to get a unique key for a DFA state (set of NFA states)
  function getSetKey(states: Set<string>): string {
    const arr = Array.from(states).sort();
    return arr.length ? arr.join("_") : "∅";
  }

  // Helper to get or assign an equivalence class name
  function getEqName(states: Set<string>): string {
    const key = getSetKey(states);
    if (!(key in stateNameMap)) {
      stateNameMap[key] = `e${eqCounter++}`;
    }
    return stateNameMap[key];
  }

  // Initial DFA state is the epsilon closure of the NFA's initial state
  const nfaInitial = nfa.states.find((s) => s.isInitial);
  if (!nfaInitial) throw new Error("NFA has no initial state");
  const initialClosure = epsilonClosure(nfa, new Set([nfaInitial.id]));

  // Use a queue for BFS
  const queue: Set<string>[] = [];
  const visited: { [key: string]: boolean } = {};

  // Start with the initial DFA state
  const initialKey = getSetKey(initialClosure);
  dfaStates[initialKey] = initialClosure;
  queue.push(initialClosure);
  visited[initialKey] = true;
  getEqName(initialClosure); // Assign e1 to initial

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = getSetKey(current);
    const currentEq = getEqName(current);

    for (const symbol of nfaAlphabet) {
      // Move on symbol, then take epsilon closure
      const moveSet = move(nfa, current, symbol);
      const closure = epsilonClosure(nfa, moveSet);
      const closureKey = getSetKey(closure);
      const closureEq = getEqName(closure);

      // Register new DFA state if not seen
      if (!(closureKey in dfaStates)) {
        dfaStates[closureKey] = closure;
      }
      if (!visited[closureKey]) {
        queue.push(closure);
        visited[closureKey] = true;
      }

      // Add DFA transition using equivalence class names
      dfaTransitions.push({
        from: currentEq,
        to: closureEq,
        symbol,
      });
    }
  }

  // DFA states
  const dfaStatesArr: State[] = Object.entries(dfaStates).map(([key, nfaStateSet]) => {
    const eqName = stateNameMap[key];
    // DFA state is final if any NFA state in the set is final
    const isFinal = Array.from(nfaStateSet).some(
      (id) => nfa.states.find((s) => s.id === id)?.isFinal
    );
    // DFA state is initial if it matches the initial closure
    const isInitial = key === getSetKey(initialClosure);
    return {
      id: eqName,
      label: eqName,
      isInitial,
      isFinal,
    };
  });

  // DFA final states
  const dfaFinalStates = dfaStatesArr.filter((s) => s.isFinal).map((s) => s.id);

  return {
    states: dfaStatesArr,
    transitions: dfaTransitions,
    alphabet: nfaAlphabet,
    initialState: stateNameMap[getSetKey(initialClosure)],
    finalStates: dfaFinalStates,
  };
}

export default function NfaToDfaConverter() {
  const [nfa, setNfa] = useState<NFA | null>(null);
  const [dfa, setDfa] = useState<DFA | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle .nfa file upload
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setNfa(null);
    setDfa(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const nfaData = JSON.parse(text);
        const nfaObj: NFA = "nfa" in nfaData ? nfaData.nfa : nfaData;
        setNfa(nfaObj);
      } catch {
        setError("Invalid .nfa file format.");
      }
    };
    reader.readAsText(file);
  }

  // Convert to DFA
  function handleConvert() {
    setError(null);
    setDfa(null);
    if (!nfa) {
      setError("No NFA loaded.");
      return;
    }
    try {
      const dfaResult = nfaToDfa(nfa);
      setDfa(dfaResult);
    } catch (e) {
      setError("Conversion failed.");
    }
  }

  // Download DFA as .dfa file
  function handleDownloadDfa() {
    if (!dfa) return;
    const blob = new Blob([JSON.stringify(dfa, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dfa.dfa";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-gray-300">
      <h3 className="text-xl font-semibold mb-3">NFA to DFA Converter</h3>
      <div className="mb-4">
        <label className="block mb-2">Upload .nfa file:</label>
        <input
          type="file"
          accept=".nfa,application/json"
          onChange={handleFileUpload}
          className="mb-2"
        />
      </div>
      {nfa && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2">NFA Diagram</h4>
          <NFADiagram nfa={nfa} />
        </div>
      )}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
        onClick={handleConvert}
        disabled={!nfa}
      >
        Convert to DFA
      </button>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {dfa && (
        <div>
          <h4 className="font-semibold mt-4 mb-2">DFA Diagram</h4>
          <NFADiagram nfa={dfa} />
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-4"
            onClick={handleDownloadDfa}
          >
            Download DFA (.dfa)
          </button>
        </div>
      )}
    </div>
  );
}
