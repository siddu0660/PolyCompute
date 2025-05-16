"use client";

import React, { useEffect, useState } from "react";
// @ts-expect-error: No types for viz.js
import Viz from "viz.js";
// @ts-expect-error: No types for viz.js/full.render.js
import { Module, render } from "viz.js/full.render.js";
import { NFA } from "./NFATypes";

interface NFADiagramProps {
  nfa: NFA;
  activeStates?: string[];
  activeTransitions?: { from: string; to: string; symbol: string }[];
}

function nfaToDot(nfa: NFA, activeStates: string[] = [], activeTransitions: { from: string; to: string; symbol: string }[] = []): string {
  // Compose DOT string for Graphviz
  let dot = 'digraph NFA {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=circle, style=filled, fillcolor="#ffffcc", fontname="Arial", fontsize=18];\n';

  // Initial state arrow
  const initial = nfa.states.find(s => s.isInitial);
  if (initial) {
    dot += `  fake_init [shape=point, width=0.1, label="", color=gray];\n`;
    dot += `  fake_init -> ${initial.id} [color=gray, penwidth=2];\n`;
  }

  // States
  for (const state of nfa.states) {
    let shape = "circle";
    let peripheries = 1;
    let color = "#888";
    let fillcolor = "#ffffcc";
    if (activeStates.includes(state.id)) {
      fillcolor = "#3b82f6"; // blue-500
      color = "#1d4ed8"; // blue-700
    } else if (state.isFinal && state.isInitial) {
      color = "#0ea5e9"; // blue
      peripheries = 2;
    } else if (state.isFinal) {
      color = "#22c55e"; // green
      peripheries = 2;
    } else if (state.isInitial) {
      color = "#2563eb"; // blue
    }
    dot += `  ${state.id} [label="${state.id}", shape=${shape}, peripheries=${peripheries}, color="${color}", fillcolor="${fillcolor}"];\n`;
  }

  // Transitions
  for (const t of nfa.transitions) {
    // Highlight if in activeTransitions
    const isActive = activeTransitions.some(at => at.from === t.from && at.to === t.to && at.symbol === t.symbol);
    dot += `  ${t.from} -> ${t.to} [label="${t.symbol}", fontname="Arial", fontsize=16, color="${isActive ? '#2563eb' : '#333'}", fontcolor="${isActive ? '#2563eb' : '#333'}", penwidth=${isActive ? 3.5 : 2.2}];\n`;
  }

  dot += '}';
  return dot;
}

export default function NFADiagram({ nfa, activeStates = [], activeTransitions = [] }: NFADiagramProps) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    if (!nfa) return;
    const dot = nfaToDot(nfa, activeStates, activeTransitions);
    const viz = new Viz({ Module, render });
    viz.renderSVGElement(dot)
      .then((element: any) => {
        setSvg(element.outerHTML);
      })
      .catch((err: any) => {
        setSvg(`<div style='color:red'>Error rendering diagram</div>`);
      });
  }, [nfa, JSON.stringify(activeStates), JSON.stringify(activeTransitions)]);

  return (
    <>
      <div className="flex justify-center w-full overflow-x-auto bg-white rounded-lg border border-gray-300 p-4">
        {/* Render SVG from viz.js */}
        <div
          className="mx-auto"
          style={{ minWidth: 400, minHeight: 200 }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </>
  );
} 