"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { NFA, NFAData, State, Transition } from "./NFATypes";
import NFADiagram from "./NFADiagram";

export default function NFASimulator() {
  const [nfa, setNFA] = useState<NFA | null>(null);
  const [input, setInput] = useState("");
  const [currentStates, setCurrentStates] = useState<Set<string>>(new Set());
  const [simulationSteps, setSimulationSteps] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [stepStates, setStepStates] = useState<Set<string>[]>([]);
  const [stepTransitions, setStepTransitions] = useState<{from: string, to: string, symbol: string}[][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as NFAData;
          setNFA(data.nfa);
          setError("");
          // Reset simulation state
          setCurrentStates(new Set());
          setSimulationSteps([]);
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

  const computeEpsilonClosure = (states: Set<string>): Set<string> => {
    const closure = new Set<string>(states);
    const stack = Array.from(states);

    while (stack.length > 0) {
      const state = stack.pop()!;
      nfa?.transitions.forEach((t) => {
        if (t.from === state && t.symbol === "ε" && !closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      });
    }

    return closure;
  };

  const simulateStep = (currentStates: Set<string>, symbol: string): Set<string> => {
    if (!nfa) return new Set();

    // Get epsilon closure of current states
    const closure = computeEpsilonClosure(currentStates);
    const nextStates = new Set<string>();

    // For each state in the closure, find transitions on the input symbol
    closure.forEach((state) => {
      nfa.transitions.forEach((t) => {
        if (t.from === state && t.symbol === symbol) {
          nextStates.add(t.to);
        }
      });
    });

    // Get epsilon closure of next states
    return computeEpsilonClosure(nextStates);
  };

  const runSimulation = () => {
    if (!nfa) {
      setError("Please load an NFA first");
      return;
    }

    // Treat input of 'ε' as the empty string
    const effectiveInput = input === "ε" ? "" : input;

    if (effectiveInput === "") {
      setError("");
      const steps: string[] = [];
      let states = new Set<string>([nfa.states.find(s => s.isInitial)?.id || ""]);
      states = computeEpsilonClosure(states);
      steps.push(`Initial states: ${Array.from(states).join(", ")}`);
      setCurrentStates(states);
      setSimulationSteps(steps);
      setStepStates([new Set(states)]);
      setStepTransitions([[]]);
      setStepIndex(0);
      // Only check for acceptance after all input is processed (here, input is empty)
      const isAccepted = Array.from(states).some(stateId => 
        nfa.states.find(s => s.id === stateId)?.isFinal
      );
      if (isAccepted) {
        setError("Input accepted!");
      } else {
        setError("Input rejected!");
      }
      return;
    }

    setError("");
    const steps: string[] = [];
    const statesSeq: Set<string>[] = [];
    const transitionsSeq: {from: string, to: string, symbol: string}[][] = [];
    let states = new Set<string>([nfa.states.find(s => s.isInitial)?.id || ""]);
    states = computeEpsilonClosure(states);
    steps.push(`Initial states: ${Array.from(states).join(", ")}`);
    statesSeq.push(new Set(states));
    transitionsSeq.push([]);

    for (let i = 0; i < effectiveInput.length; i++) {
      const symbol = effectiveInput[i];
      const closure = computeEpsilonClosure(states);
      // Find all transitions taken for this symbol
      const taken: {from: string, to: string, symbol: string}[] = [];
      closure.forEach((state) => {
        nfa.transitions.forEach((t) => {
          if (t.from === state && t.symbol === symbol) {
            taken.push({from: t.from, to: t.to, symbol: t.symbol});
          }
        });
      });
      const nextStates = simulateStep(states, symbol);
      if (nextStates.size === 0) {
        steps.push(`No transition from current states on input '${symbol}'`);
        states = nextStates;
        statesSeq.push(new Set());
        transitionsSeq.push([]);
        // Do NOT check for acceptance here; process all input first
        break;
      }
      states = nextStates;
      steps.push(`After reading '${symbol}': ${Array.from(states).join(", ")}`);
      statesSeq.push(new Set(states));
      transitionsSeq.push(taken);
    }

    setCurrentStates(states);
    setSimulationSteps(steps);
    setStepStates(statesSeq);
    setStepTransitions(transitionsSeq);
    setStepIndex(statesSeq.length - 1); // Default to last step

    // Only check for acceptance after all input is processed
    const isAccepted = Array.from(states).some(stateId => 
      nfa.states.find(s => s.id === stateId)?.isFinal
    );

    if (isAccepted) {
      setError("Input accepted!");
    } else {
      setError("Input rejected!");
    }
  };

  // Animation effect
  useEffect(() => {
    if (isAnimating && stepStates.length > 1) {
      if (stepIndex < stepStates.length - 1) {
        animationRef.current = setTimeout(() => {
          setStepIndex(i => i + 1);
        }, 700);
      } else {
        setIsAnimating(false);
      }
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isAnimating, stepIndex, stepStates.length]);

  // Start animation after stepStates update
  useEffect(() => {
    if (shouldAnimate && stepStates.length > 1) {
      setIsAnimating(true);
      setShouldAnimate(false);
    }
  }, [shouldAnimate, stepStates.length]);

  // When Simulate is clicked, just run simulation and set up for animation
  const handleSimulate = () => {
    setIsAnimating(false); // Always stop animation before running
    runSimulation();
    setStepIndex(0);
    setShouldAnimate(true);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-gray-800/60 backdrop-blur rounded-lg p-8 border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">NFA Simulator</h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors mb-8 bg-gray-900/60 hover:bg-gray-900/80 border-gray-600 hover:border-blue-500 focus-within:border-blue-500 outline-none`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-200 text-base font-medium">
            {isDragActive
              ? "Drop the NFA file here"
              : "Drag and drop an NFA file here, or click to select"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Only <span className="font-mono">.nfa</span> files are accepted
          </p>
        </div>

        {nfa && (
          <div className="space-y-8">
            <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
              <h4 className="text-lg font-semibold mb-4 text-white">NFA Diagram</h4>
              <NFADiagram
                nfa={nfa}
                activeStates={stepStates[stepIndex] ? Array.from(stepStates[stepIndex]) : []}
                activeTransitions={stepTransitions[stepIndex] ? stepTransitions[stepIndex] : []}
              />
              {stepStates.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => setStepIndex(i => Math.max(0, i - 1))}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={stepIndex === 0 || isAnimating}
                  >
                    Previous Step
                  </button>
                  <span className="text-gray-200 font-mono">Step {stepIndex + 1} / {stepStates.length}</span>
                  <button
                    onClick={() => setStepIndex(i => Math.min(stepStates.length - 1, i + 1))}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={stepIndex === stepStates.length - 1 || isAnimating}
                  >
                    Next Step
                  </button>
                </div>
              )}

            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-200 mb-2">
                  Input String
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="Enter input string"
                  />
                  <button
                    onClick={() => setInput(input + "ε")}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-semibold"
                    title="Insert epsilon (ε)"
                  >
                    ε
                  </button>
                  <button
                    onClick={handleSimulate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
                    disabled={isAnimating}
                  >
                    Simulate
                  </button>
                  {stepStates.length > 1 && (
                    <button
                      onClick={() => setIsAnimating(a => !a)}
                      className={`px-4 py-2 rounded-md font-semibold transition-colors ${isAnimating ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-gray-700 hover:bg-blue-700 text-white"}`}
                      disabled={stepStates.length <= 1}
                    >
                      {isAnimating ? "Pause" : "Resume"}
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className={`p-4 rounded-md text-lg font-semibold mt-2 shadow ${
                  error.includes("accepted")
                    ? "bg-green-900/60 text-green-200 border border-green-700"
                    : error.includes("rejected")
                    ? "bg-red-900/60 text-red-200 border border-red-700"
                    : "bg-yellow-900/60 text-yellow-200 border border-yellow-700"
                }`}>
                  {error}
                </div>
              )}

              {simulationSteps.length > 0 && (
                <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 mt-4">
                  <h4 className="text-lg font-semibold mb-3 text-white">Simulation Steps</h4>
                  <div className="flex flex-col gap-4">
                    {stepStates.map((statesBefore, idx) => {
                      const isLast = idx === stepStates.length - 1;
                      const inputChar = idx === 0 ? "ε" : input[idx - 1] || "";
                      const transitions = stepTransitions[idx] || [];
                      const statesAfter = statesBefore;
                      return (
                        <div
                          key={idx}
                          className={`rounded-lg p-4 border ${stepIndex === idx ? "border-blue-500 bg-blue-900/30" : "border-gray-700 bg-gray-800/60"} shadow-sm transition-all`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-gray-400">Step {idx + 1}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-200 font-mono">
                              Input: {inputChar === "ε" ? <span>&epsilon;</span> : inputChar}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm text-gray-300">States before:</span>
                            {Array.from(idx === 0 ? statesBefore : stepStates[idx - 1]).map(s => (
                              <span key={s} className="px-2 py-0.5 rounded bg-blue-800/60 text-blue-100 font-mono text-xs border border-blue-700">{s}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm text-gray-300">Transitions:</span>
                            {transitions.length === 0 ? (
                              <span className="text-xs text-gray-400">(none)</span>
                            ) : (
                              transitions.map((t, i) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-800/60 text-green-100 font-mono text-xs border border-green-700">
                                  {t.from} <span className="text-gray-400">→</span> {t.to} <span className="text-gray-400">on</span> {t.symbol === "ε" ? <span>&epsilon;</span> : t.symbol}
                                </span>
                              ))
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-300">States after:</span>
                            {Array.from(statesAfter).length === 0 ? (
                              <span className="text-xs text-red-300">(none)</span>
                            ) : (
                              Array.from(statesAfter).map(s => (
                                <span key={s} className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-100 font-mono text-xs border border-blue-800">{s}</span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 