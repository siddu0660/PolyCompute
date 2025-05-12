export interface State {
  id: string;
  isFinal: boolean;
  isInitial: boolean;
  label: string;
}

export interface Transition {
  from: string;
  to: string;
  symbol: string;
}

export interface NFA {
  states: State[];
  transitions: Transition[];
  alphabet: string[];
}

export interface NFAData {
  nfa: NFA;
  metadata: {
    name: string;
    description: string;
    created: string;
    regex: string;
  };
} 