import { NFA, State, Transition } from "./NFATypes";

export interface DFA {
  states: State[];
  transitions: Transition[];
  alphabet: string[];
  initialState: string;
  finalStates: string[];
}

/**
 * Converts an NFA to an equivalent DFA using the subset construction algorithm.
 * @param nfa The NFA to convert.
 * @returns The equivalent DFA.
 */
export function nfaToDfa(nfa: NFA): DFA {
  // Helper: Compute epsilon closure for a set of NFA state ids
  function epsilonClosure(states: Set<string>): Set<string> {
    const closure = new Set(states);
    const stack = [...states];
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
  function move(states: Set<string>, symbol: string): Set<string> {
    const result = new Set<string>();
    for (const state of states) {
      for (const t of nfa.transitions) {
        if (t.from === state && t.symbol === symbol) {
          result.add(t.to);
        }
      }
    }
    return result;
  }

  // DFA construction
  const nfaAlphabet = nfa.alphabet.filter((a) => a !== "ε");
  const dfaStates: { [key: string]: Set<string> } = {};
  const dfaTransitions: Transition[] = [];
  const dfaStateNames: { [key: string]: string } = {};

  // Initial DFA state is the epsilon closure of the NFA's initial state
  const nfaInitial = nfa.states.find((s) => s.isInitial);
  if (!nfaInitial) throw new Error("NFA has no initial state");
  const initialClosure = epsilonClosure(new Set([nfaInitial.id]));

  // Use a queue for BFS
  const queue: Set<string>[] = [];
  const visited: { [key: string]: boolean } = {};

  // Helper to get a unique name for a DFA state (set of NFA states)
  function getStateName(states: Set<string>): string {
    const arr = Array.from(states).sort();
    return arr.length ? arr.join("_") : "∅";
  }

  // Start with the initial DFA state
  const initialName = getStateName(initialClosure);
  dfaStates[initialName] = initialClosure;
  dfaStateNames[initialName] = initialName;
  queue.push(initialClosure);
  visited[initialName] = true;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentName = getStateName(current);

    for (const symbol of nfaAlphabet) {
      // Move on symbol, then take epsilon closure
      const moveSet = move(current, symbol);
      const closure = epsilonClosure(moveSet);
      const closureName = getStateName(closure);

      // Register new DFA state if not seen
      if (!(closureName in dfaStates)) {
        dfaStates[closureName] = closure;
        dfaStateNames[closureName] = closureName;
      }
      if (!visited[closureName]) {
        queue.push(closure);
        visited[closureName] = true;
      }

      // Add DFA transition
      dfaTransitions.push({
        from: currentName,
        to: closureName,
        symbol,
      });
    }
  }

  // DFA states
  const dfaStatesArr: State[] = Object.keys(dfaStates).map((name) => {
    const nfaStateSet = dfaStates[name];
    // DFA state is final if any NFA state in the set is final
    const isFinal = Array.from(nfaStateSet).some(
      (id) => nfa.states.find((s) => s.id === id)?.isFinal
    );
    // DFA state is initial if it matches the initial closure
    const isInitial = name === initialName;
    return {
      id: name,
      label: name,
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
    initialState: initialName,
    finalStates: dfaFinalStates,
  };
}