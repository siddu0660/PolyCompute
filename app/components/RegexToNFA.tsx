"use client";

import { useState, useCallback, useEffect } from "react";
import { NFA, NFAData, State, Transition } from "./NFATypes";
import { useDropzone } from "react-dropzone";

let globalStateCounter = 0;
function getNextStateId() {
  return `q${globalStateCounter++}`;
}

function resetStateCounter() {
  globalStateCounter = 0;
}

type NodeType = {
  id: string;
  x: number;
  y: number;
  isInitial: boolean;
  isFinal: boolean;
  label: string;
};
type EdgeType = {
  from: string;
  to: string;
  label: string;
};

export default function RegexToNFA() {
  const [regex, setRegex] = useState("");
  const [nfa, setNFA] = useState<NFA | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as NFAData;
          setNFA(data.nfa);
          setName(data.metadata.name);
          setDescription(data.metadata.description);
          setRegex(data.metadata.regex);
          globalStateCounter =
            Math.max(
              ...data.nfa.states.map((s) => parseInt(s.id.replace("q", "")))
            ) + 1;
        } catch (err) {
          setError("Invalid NFA file format");
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".nfa"],
    },
    multiple: false,
  });

  const createBasicNFA = (symbol: string): NFA => {
    const s0 = getNextStateId();
    const s1 = getNextStateId();
    const states: State[] = [
      { id: s0, isInitial: true, isFinal: false, label: s0 },
      { id: s1, isInitial: false, isFinal: true, label: s1 },
    ];
    const transitions: Transition[] = [{ from: s0, to: s1, symbol }];
    return { states, transitions, alphabet: [symbol] };
  };

  const unionNFAs = (nfa1: NFA, nfa2: NFA): NFA => {
    const start = getNextStateId();
    const end = getNextStateId();
    // Mark all as not initial/final
    const states = [
      { id: start, isInitial: true, isFinal: false, label: start },
      ...nfa1.states.map((s) => ({ ...s, isInitial: false, isFinal: false })),
      ...nfa2.states.map((s) => ({ ...s, isInitial: false, isFinal: false })),
      { id: end, isInitial: false, isFinal: true, label: end },
    ];
    const transitions: Transition[] = [
      {
        from: start,
        to: nfa1.states.find((s) => s.isInitial)?.id || "",
        symbol: "ε",
      },
      {
        from: start,
        to: nfa2.states.find((s) => s.isInitial)?.id || "",
        symbol: "ε",
      },
      ...nfa1.transitions,
      ...nfa2.transitions,
      ...nfa1.states
        .filter((s) => s.isFinal)
        .map((s) => ({ from: s.id, to: end, symbol: "ε" })),
      ...nfa2.states
        .filter((s) => s.isFinal)
        .map((s) => ({ from: s.id, to: end, symbol: "ε" })),
    ];
    return {
      states,
      transitions,
      alphabet: [...new Set([...nfa1.alphabet, ...nfa2.alphabet])],
    };
  };

  const concatenateNFAs = (nfa1: NFA, nfa2: NFA): NFA => {
    // Keep state IDs as they are
    const states = [
      ...nfa1.states.map((s) => ({ ...s, isFinal: false })),
      ...nfa2.states.map((s) => ({ ...s, isInitial: false })),
    ];

    // Get the initial state of nfa2
    const nfa2Initial = nfa2.states.find((s) => s.isInitial)?.id || "";

    const transitions: Transition[] = [
      ...nfa1.transitions,
      ...nfa2.transitions,
      ...nfa1.states
        .filter((s) => s.isFinal)
        .map((s) => ({
          from: s.id,
          to: nfa2Initial,
          symbol: "ε",
        })),
    ];

    return {
      states,
      transitions,
      alphabet: [...new Set([...nfa1.alphabet, ...nfa2.alphabet])],
    };
  };

  const kleeneStarNFA = (nfa: NFA): NFA => {
    const start = getNextStateId();
    const end = getNextStateId();
    const nfaInitial = nfa.states.find((s) => s.isInitial)?.id || "";

    const states = [
      { id: start, isInitial: true, isFinal: false, label: start },
      ...nfa.states.map((s) => ({ ...s, isInitial: false, isFinal: false })),
      { id: end, isInitial: false, isFinal: true, label: end },
    ];

    const transitions: Transition[] = [
      { from: start, to: nfaInitial, symbol: "ε" },
      { from: start, to: end, symbol: "ε" },
      ...nfa.transitions,
      ...nfa.states
        .filter((s) => s.isFinal)
        .map((s) => ({ from: s.id, to: nfaInitial, symbol: "ε" })),
      ...nfa.states
        .filter((s) => s.isFinal)
        .map((s) => ({ from: s.id, to: end, symbol: "ε" })),
    ];

    return { states, transitions, alphabet: nfa.alphabet };
  };

  const parseRegexToNFA = (regex: string): NFA => {
    const concatExplicit = makeExplicitConcatenation(regex);
    const postfix = infixToPostfix(concatExplicit);
    const stack: NFA[] = [];

    for (let i = 0; i < postfix.length; i++) {
      const token = postfix[i];

      if (token === "*") {
        if (stack.length < 1)
          throw new Error(
            "Invalid regex: insufficient operand for Kleene star"
          );
        const operand = stack.pop()!;
        stack.push(kleeneStarNFA(operand));
      } else if (token === "|") {
        if (stack.length < 2)
          throw new Error("Invalid regex: insufficient operands for union");
        const right = stack.pop()!;
        const left = stack.pop()!;
        stack.push(unionNFAs(left, right));
      } else if (token === ".") {
        if (stack.length < 2)
          throw new Error(
            "Invalid regex: insufficient operands for concatenation"
          );
        const right = stack.pop()!;
        const left = stack.pop()!;
        stack.push(concatenateNFAs(left, right));
      } else {
        // Token is a symbol
        stack.push(createBasicNFA(token));
      }
    }

    if (stack.length !== 1) {
      throw new Error("Invalid regex: parsing error");
    }

    return stack[0];
  };

  const makeExplicitConcatenation = (regex: string): string => {
    let result = "";

    for (let i = 0; i < regex.length; i++) {
      const current = regex[i];
      result += current;

      if (i < regex.length - 1) {
        const next = regex[i + 1];
        // Add explicit concatenation operator if needed
        if (
          current !== "(" &&
          current !== "|" &&
          next !== ")" &&
          next !== "|" &&
          next !== "*"
        ) {
          result += ".";
        }
      }
    }

    return result;
  };

  const infixToPostfix = (infix: string): string => {
    let output = "";
    const operators: string[] = [];
    const precedence: Record<string, number> = {
      "|": 1,
      ".": 2,
      "*": 3,
    };

    for (let i = 0; i < infix.length; i++) {
      const token = infix[i];

      if (token === "(") {
        operators.push(token);
      } else if (token === ")") {
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== "("
        ) {
          output += operators.pop();
        }
        operators.pop(); // Discard the '('
      } else if (token === "|" || token === "." || token === "*") {
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== "(" &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          output += operators.pop();
        }
        operators.push(token);
      } else {
        // Token is a symbol
        output += token;
      }
    }

    // Pop remaining operators
    while (operators.length > 0) {
      output += operators.pop();
    }

    return output;
  };

  const removeEpsilonTransitions = (nfa: NFA): NFA => {
    const epsilon = 'ε';
    // 1. Compute epsilon-closure for each state
    const closure: Record<string, Set<string>> = {};
    for (const state of nfa.states) {
      const stack: string[] = [state.id];
      const visited = new Set<string>([state.id]);
      while (stack.length) {
        const curr = stack.pop()!;
        for (const t of nfa.transitions) {
          if (t.from === curr && t.symbol === epsilon && !visited.has(t.to)) {
            visited.add(t.to);
            stack.push(t.to);
          }
        }
      }
      closure[state.id] = visited;
    }

    // 2. Build new transitions (excluding epsilon)
    const newTransitions: Transition[] = [];
    for (const state of nfa.states) {
      const targets = closure[state.id];
      for (const target of targets) {
        for (const t of nfa.transitions) {
          if (t.from === target && t.symbol !== epsilon) {
            newTransitions.push({ from: state.id, to: t.to, symbol: t.symbol });
          }
        }
      }
    }

    // 3. Mark state as final if any in its closure is final
    const finalStates = new Set<string>(
      nfa.states.filter((s: State) => s.isFinal).map((s: State) => s.id)
    );
    const newStates: State[] = nfa.states.map((s: State) => ({
      ...s,
      isFinal: Array.from(closure[s.id]).some(id => finalStates.has(id)),
    }));

    // 4. Remove duplicate transitions
    const uniqueTransitions: Transition[] = Array.from(
      new Set(newTransitions.map(t => `${t.from}|${t.to}|${t.symbol}`))
    ).map(str => {
      const [from, to, symbol] = str.split('|');
      return { from, to, symbol };
    });

    return {
      states: newStates,
      transitions: uniqueTransitions,
      alphabet: nfa.alphabet,
    };
  };

  const convertRegexToNFA = () => {
    if (!regex) {
      setError("Please enter a regular expression");
      return;
    }

    try {
      resetStateCounter();
      const parsedNFA: NFA = parseRegexToNFA(regex);
      const nfaNoEpsilon: NFA = removeEpsilonTransitions(parsedNFA);
      setNFA(nfaNoEpsilon);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error converting regex to NFA"
      );
    }
  };

  const exportNFA = () => {
    if (!nfa) return;

    const nfaData: NFAData = {
      nfa,
      metadata: {
        name: name || "Untitled NFA",
        description: description || "No description",
        created: new Date().toISOString(),
        regex,
      },
    };

    const blob = new Blob([JSON.stringify(nfaData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "nfa"}.nfa`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group transitions by state and symbol for better display
  const getTransitionTable = () => {
    if (!nfa) return [];

    const table = [];
    const allSymbols = [...new Set([...nfa.alphabet, "ε"])];

    for (const state of nfa.states) {
      for (const symbol of allSymbols) {
        const nextStates = nfa.transitions
          .filter((t) => t.from === state.id && t.symbol === symbol)
          .map((t) => t.to);

        // Only add row if there is at least one next state
        if (nextStates.length > 0) {
          table.push({
            state: state.label,
            symbol,
            nextStates: nextStates.join(", "),
          });
        }
      }
    }

    return table;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Convert Regex to NFA</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Regular Expression
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter regex (e.g., a|b*)"
              />
              <button
                onClick={convertRegexToNFA}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Supported operations: concatenation (ab), union (a|b), Kleene star
              (a*)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              NFA Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter NFA name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows={3}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-md">{error}</div>
      )}

      {nfa && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">NFA Visualization</h3>
            <button
              onClick={exportNFA}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Export NFA
            </button>
          </div>
          <div className="space-y-6">
            {/* Improved State Transition Table */}
            <div className="mb-6 bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h4 className="text-lg font-medium mb-4">
                State Transition Table
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="px-4 py-2 text-left text-gray-300">
                        State
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300">
                        Input Symbol
                      </th>
                      <th className="px-4 py-2 text-left text-gray-300">
                        Next State(s)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTransitionTable().map((row, i) => (
                      <tr key={i} className="border-t border-gray-800">
                        <td className="px-4 py-2 text-gray-200">
                          {row.state}
                          {nfa.states.find((s) => s.label === row.state)
                            ?.isInitial && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-900 text-blue-200 rounded-full text-xs">
                              Initial
                            </span>
                          )}
                          {nfa.states.find((s) => s.label === row.state)
                            ?.isFinal && (
                            <span className="ml-2 px-2 py-0.5 bg-green-900 text-green-200 rounded-full text-xs">
                              Final
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-200 font-mono">
                          {row.symbol}
                        </td>
                        <td className="px-4 py-2 text-gray-200 font-mono">
                          {row.nextStates}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* States Section */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h4 className="text-lg font-medium mb-4">States</h4>
                <div className="grid grid-cols-2 gap-4">
                  {nfa.states.map((state) => (
                    <div
                      key={state.id}
                      className={`p-3 rounded-md flex items-center justify-between ${
                        state.isInitial && state.isFinal
                          ? "bg-gradient-to-r from-blue-800 to-green-800"
                          : state.isInitial
                          ? "bg-blue-800/50"
                          : state.isFinal
                          ? "bg-green-800/50"
                          : "bg-gray-700"
                      }`}
                    >
                      <span>{state.label}</span>
                      <div className="flex gap-2">
                        {state.isInitial && (
                          <span className="px-2 py-0.5 bg-blue-900 text-blue-200 rounded text-xs">
                            Initial
                          </span>
                        )}
                        {state.isFinal && (
                          <span className="px-2 py-0.5 bg-green-900 text-green-200 rounded text-xs">
                            Final
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transitions Section */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h4 className="text-lg font-medium mb-4">Transitions</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {nfa.transitions.map((transition, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-700 rounded-md flex items-center justify-between"
                    >
                      <span className="font-mono">
                        {transition.from} → {transition.to}
                      </span>
                      <span className="px-2 py-1 bg-gray-600 rounded text-sm font-mono">
                        {transition.symbol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alphabet Section */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h4 className="text-lg font-medium mb-4">Alphabet</h4>
              <div className="flex flex-wrap gap-2">
                {nfa.alphabet.map((symbol) => (
                  <span
                    key={symbol}
                    className="px-3 py-1 bg-blue-800/30 border border-blue-700 rounded-md font-mono"
                  >
                    {symbol}
                  </span>
                ))}
                {nfa.transitions.some((t) => t.symbol === "ε") && (
                  <span className="px-3 py-1 bg-purple-800/30 border border-purple-700 rounded-md font-mono">
                    ε (epsilon)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 hover:border-gray-500"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-300">
          {isDragActive
            ? "Drop the NFA file here"
            : "Drag and drop an NFA file here, or click to select"}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Only .nfa files are accepted
        </p>
      </div>
    </div>
  );
}
