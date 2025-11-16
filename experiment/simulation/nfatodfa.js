/*****
 * File containing main logic for interactive NFA to DFA conversion
 * Uses powerset construction method to convert NFAs to equivalent DFAs
 */

// Global variables
let width = 800;  
let height = 450; 
let radius = 38;  

let automata = [];
let automataIndex = 0;
let userDFA = { states: [], transitions: [], startState: null, acceptStates: [] };
let constructionSteps = [];
let selectedStates = new Set(); // For multi-select when creating DFA states
let constructionMode = 'none'; // 'none', 'add_state', 'add_transition'
let transitionSource = null; // For transition creation

// Undo system
let undoStack = []; // Stack of actions that can be undone

// Action types for undo system
const ACTION_TYPES = {
  CREATE_STATE: 'create_state',
  ADD_TRANSITION: 'add_transition',
  TOGGLE_ACCEPT: 'toggle_accept'
};

// Function to save state for undo
function saveUndoAction(actionType, data) {
  undoStack.push({
    type: actionType,
    data: data,
    timestamp: Date.now()
  });
  
  // Limit undo stack size to prevent memory issues
  if (undoStack.length > 50) {
    undoStack.shift();
  }
  
  updateUndoButton();
}

// Function to update undo button state
function updateUndoButton() {
  const undoButton = document.getElementById("undo_action");
  if (undoButton) {
    undoButton.disabled = undoStack.length === 0;
    undoButton.style.opacity = undoButton.disabled ? 0.5 : 1;
    undoButton.style.cursor = undoButton.disabled ? "not-allowed" : "pointer";
  }
}

// Function to perform undo
function performUndo() {
  if (undoStack.length === 0) {
    swal("Nothing to undo!", "No actions available to undo.", "info");
    return;
  }
  
  const lastAction = undoStack.pop();
  
  switch (lastAction.type) {
    case ACTION_TYPES.CREATE_STATE:
      undoCreateState(lastAction.data);
      break;
    case ACTION_TYPES.ADD_TRANSITION:
      undoAddTransition(lastAction.data);
      break;
    case ACTION_TYPES.TOGGLE_ACCEPT:
      undoToggleAccept(lastAction.data);
      break;
  }
  
  updateUndoButton();
  refreshDFACanvas();
}

// Undo functions for different action types
function undoCreateState(data) {
  const stateName = data.stateName;
  
  // Remove the state from userDFA
  userDFA.states = userDFA.states.filter(s => s.name !== stateName);
  
  // Remove any transitions involving this state
  const removedTransitions = userDFA.transitions.filter(t => 
    t.from === stateName || t.to === stateName
  );
  userDFA.transitions = userDFA.transitions.filter(t => 
    t.from !== stateName && t.to !== stateName
  );
  
  addConstructionStep(`Undone: Removed state ${stateName}${removedTransitions.length > 0 ? ` and ${removedTransitions.length} associated transitions` : ''}`);
}

function undoAddTransition(data) {
  const { from, to, symbol } = data;
  
  // Remove the transition
  userDFA.transitions = userDFA.transitions.filter(t => 
    !(t.from === from && t.to === to && t.symbol === symbol)
  );
  
  addConstructionStep(`Undone: Removed transition ${from} --${symbol}--> ${to}`);
}

function undoToggleAccept(data) {
  const { stateName, wasAccept } = data;
  
  // Find the state and restore its accept status
  const state = userDFA.states.find(s => s.name === stateName);
  if (state) {
    state.isAccept = wasAccept;
    addConstructionStep(`Undone: Restored accept status for ${stateName} to ${wasAccept ? 'accepting' : 'non-accepting'}`);
  }
}

// --- NFA Data Definitions for Conversion Exercise ---

const nfa1 = {
  description: "ε-NFA: Accepts strings containing 'ab' or 'ba' as substring",
  alphabet: ['a', 'b'],
  vertices: [
    { text: "q0", type: "start",  x: 120, y: 225 },
    { text: "q1", type: "none",   x: 280, y: 120 },
    { text: "q2", type: "none",   x: 450, y: 120 },
    { text: "q4", type: "none",   x: 280, y: 330 },
    { text: "q5", type: "accept", x: 450, y: 330 },
    { text: "q3", type: "accept", x: 600, y: 225 }
  ],
  edges: [
    { start: "q0", end: "q0", text: ["a","b"], type: "self" },
    { start: "q0", end: "q1", text: "ε", type: "forward" },
    { start: "q0", end: "q4", text: "ε", type: "forward" },
    { start: "q1", end: "q2", text: "a", type: "forward" },
    { start: "q2", end: "q3", text: "b", type: "forward" },
    { start: "q4", end: "q5", text: "b", type: "forward" },
    { start: "q5", end: "q3", text: "a", type: "forward" },
    { start: "q3", end: "q3", text: ["a","b"], type: "self" }
  ],
  // Expected DFA states (for validation)
  expectedDFA: {
    states: [
      { name: "{q0,q1,q4}", isStart: true, isAccept: false, nfaStates: ["q0", "q1", "q4"] },
      { name: "{q0,q1,q2,q4}", isStart: false, isAccept: false, nfaStates: ["q0", "q1", "q2", "q4"] },
      { name: "{q0,q1,q4,q5}", isStart: false, isAccept: false, nfaStates: ["q0", "q1", "q4", "q5"] },
      { name: "{q0,q1,q3,q4,q5}", isStart: false, isAccept: true, nfaStates: ["q0", "q1", "q3", "q4", "q5"] },
      { name: "{q0,q1,q2,q3,q4}", isStart: false, isAccept: true, nfaStates: ["q0", "q1", "q2", "q3", "q4"] }
    ],
    transitions: [
      { from: "{q0,q1,q4}", to: "{q0,q1,q2,q4}", symbol: "a" },
      { from: "{q0,q1,q4}", to: "{q0,q1,q4,q5}", symbol: "b" },
      { from: "{q0,q1,q2,q4}", to: "{q0,q1,q2,q4}", symbol: "a" },
      { from: "{q0,q1,q2,q4}", to: "{q0,q1,q3,q4,q5}", symbol: "b" },
      { from: "{q0,q1,q4,q5}", to: "{q0,q1,q2,q3,q4}", symbol: "a" },
      { from: "{q0,q1,q4,q5}", to: "{q0,q1,q3,q4,q5}", symbol: "b" },
      { from: "{q0,q1,q3,q4,q5}", to: "{q0,q1,q2,q3,q4}", symbol: "a" },
      { from: "{q0,q1,q3,q4,q5}", to: "{q0,q1,q3,q4,q5}", symbol: "b" },
      { from: "{q0,q1,q2,q3,q4}", to: "{q0,q1,q2,q3,q4}", symbol: "a" },
      { from: "{q0,q1,q2,q3,q4}", to: "{q0,q1,q3,q4,q5}", symbol: "b" }
    ]
  }
};

const nfa2 = {
  description: "ε-NFA: Accepts strings ending with '01' or containing just '1'",
  alphabet: ['0', '1'],
  vertices: [
    { text: "s", type: "start",  x: 120, y: 225 },
    { text: "c", type: "none",   x: 320, y: 140 }, 
    { text: "a", type: "none",   x: 320, y: 310 }, 
    { text: "b", type: "accept", x: 520, y: 225 }
  ],
  edges: [
    { start: "s", end: "s", text: ["0", "1"], type: "self" },
    { start: "s", end: "a", text: "0", type: "forward" },
    { start: "s", end: "c", text: "ε", type: "forward" },
    { start: "a", end: "b", text: "1", type: "forward" },
    { start: "c", end: "b", text: "1", type: "forward" }
  ],
  expectedDFA: {
    states: [
      { name: "{s,c}", isStart: true, isAccept: false, nfaStates: ["s", "c"] },
      { name: "{s,c,a}", isStart: false, isAccept: false, nfaStates: ["s", "c", "a"] },
      { name: "{s,c,b}", isStart: false, isAccept: true, nfaStates: ["s", "c", "b"] }
    ],
    transitions: [
      { from: "{s,c}", to: "{s,c,a}", symbol: "0" },
      { from: "{s,c}", to: "{s,c,b}", symbol: "1" },
      { from: "{s,c,a}", to: "{s,c,a}", symbol: "0" },
      { from: "{s,c,a}", to: "{s,c,b}", symbol: "1" },
      { from: "{s,c,b}", to: "{s,c,a}", symbol: "0" },
      { from: "{s,c,b}", to: "{s,c,b}", symbol: "1" }
    ]
  }
};

const nfa3 = {
  description: "ε-NFA: Optional middle 'a' - accepts b*ab* ∪ b*",
  alphabet: ['a', 'b'],
  vertices: [
    { text: "q0", type: "start",  x: 150, y: 225 },
    { text: "q1", type: "none",   x: 400, y: 160 },
    { text: "q2", type: "accept", x: 650, y: 225 }
  ],
  edges: [
    { start: "q0", end: "q0", text: "b", type: "self" },
    { start: "q2", end: "q2", text: "b", type: "self" },
    { start: "q0", end: "q1", text: "a", type: "forward" },
    { start: "q0", end: "q2", text: "ε", type: "forward" },
    { start: "q1", end: "q2", text: "ε", type: "forward" }
  ],
  expectedDFA: {
    states: [
      { name: "{q0,q2}", isStart: true, isAccept: true, nfaStates: ["q0", "q2"] },
      { name: "{q1,q2}", isStart: false, isAccept: true, nfaStates: ["q1", "q2"] },
      { name: "{q2}", isStart: false, isAccept: true, nfaStates: ["q2"] }
    ],
    transitions: [
      { from: "{q0,q2}", to: "{q1,q2}", symbol: "a" },
      { from: "{q0,q2}", to: "{q0,q2}", symbol: "b" },
      { from: "{q1,q2}", to: "{q2}", symbol: "b" },
      { from: "{q2}", to: "{q2}", symbol: "b" }
    ]
  }
};

// Update the automata array
automata = [nfa2, nfa3, nfa1];

// Helper Functions
function newElementNS(tag, attr) {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
  attr.forEach(function ([name, value]) {
    elem.setAttribute(name, value);
  });
  return elem;
}

function newElement(tag, attr) {
  const elem = document.createElement(tag);
  attr.forEach(function ([name, value]) {
    elem.setAttribute(name, value);
  });
  return elem;
}

function clearElem(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.lastChild);
  }
}

// Helper function to create curved path (simplified from DFA version)
function createCurvedPath(start, end, curveFactor) {
  if (Math.abs(curveFactor) < 5) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const mid = {
    x: (start.x + end.x) / 2 + Math.sin(angle) * curveFactor,
    y: (start.y + end.y) / 2 - Math.cos(angle) * curveFactor
  };
  return `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;
}

// Helper Functions
function updateButtonStates() {
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const currentInput = automata[automataIndex]["input"][inputIndex];
  if (!prevBtn || !nextBtn || !currentInput) return;
  const inputStr = currentInput["string"];
  prevBtn.disabled = inputPointer <= 0;
  nextBtn.disabled = inputPointer >= inputStr.length;
  // Add visual feedback for disabled state
  prevBtn.style.opacity = prevBtn.disabled ? 0.5 : 1;
  nextBtn.style.opacity = nextBtn.disabled ? 0.5 : 1;
  prevBtn.style.cursor = prevBtn.disabled ? "not-allowed" : "pointer";
  nextBtn.style.cursor = nextBtn.disabled ? "not-allowed" : "pointer";
}

// --- Display Functions ---

// Display NFA on the left canvas
function displayNFA(canvas, nfa) {
  clearElem(canvas);
  
  // Add arrowhead definition
  const defs = newElementNS("defs", []);
  const marker = newElementNS("marker", [
    ["id", "arrowhead"], ["markerWidth", "7"], ["markerHeight", "5"],
    ["refX", "6"], ["refY", "2.5"], ["orient", "auto"], ["markerUnits", "strokeWidth"]
  ]);
  const arrowPath = newElementNS("path", [
    ["d", "M0,0 L7,2.5 L0,5 L2,2.5 Z"], ["fill", "#222"], ["stroke", "#222"], ["stroke-width", "0.5"]
  ]);
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  canvas.appendChild(defs);

  // Get optimal bounding box and scaling
  const nodes = nfa.vertices;
  let minX = Math.min(...nodes.map(n => n.x)) - radius - 60; // Increased padding
  let maxX = Math.max(...nodes.map(n => n.x)) + radius + 60;
  let minY = Math.min(...nodes.map(n => n.y)) - radius - 80; // Extra padding for self-loops
  let maxY = Math.max(...nodes.map(n => n.y)) + radius + 60;

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const scaleX = (width - 40) / contentWidth; // Leave margin
  const scaleY = (height - 40) / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1.0);
  
  const tx = (width - contentWidth * scale) / 2 - minX * scale;
  const ty = (height - contentHeight * scale) / 2 - minY * scale;

  const group = newElementNS("g", [["transform", `translate(${tx},${ty}) scale(${scale})`]]);
  canvas.appendChild(group);

  // Draw edges
  nfa.edges.forEach(edge => {
    const startNode = nodes.find(n => n.text === edge.start);
    const endNode = nodes.find(n => n.text === edge.end);
    
    if (edge.type === "self") {
      const x = startNode.x;
      const y = startNode.y + radius + 5;
      const r = Math.max(12, radius * 0.95);
      const pathStr = `M ${x} ${y} A ${r} ${r} 0 1 1 ${x - 0.1} ${y}`;
      const labelPos = { x: x, y: y + r + 14 };
      
      const isEpsilon = (Array.isArray(edge.text) && edge.text.includes("ε")) || edge.text === "ε";
      const pathElem = newElementNS("path", [
        ["d", pathStr], ["fill", "none"],
        ["stroke", isEpsilon ? "#888" : "#333"], ["stroke-width", "2"],
        ["marker-end", "url(#arrowhead)"], ["opacity", "0.95"]
      ]);
      if (isEpsilon) pathElem.setAttribute("stroke-dasharray", "5,3");
      group.appendChild(pathElem);
      
      const labelStr = Array.isArray(edge.text) ? edge.text.join(", ") : edge.text;
      const edgeLabel = newElementNS("text", [
        ["fill", isEpsilon ? "#555" : "#222"], ["font-family", "Inter, sans-serif"],
        ["font-size", "12"], ["font-weight", "600"], ["text-anchor", "middle"],
        ["dominant-baseline", "middle"], ["x", labelPos.x], ["y", labelPos.y]
      ]);
      edgeLabel.textContent = labelStr;
      group.appendChild(edgeLabel);
    } else {
      const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
      const start = {
        x: startNode.x + radius * Math.cos(angle),
        y: startNode.y + radius * Math.sin(angle)
      };
      const end = {
        x: endNode.x - radius * Math.cos(angle),
        y: endNode.y - radius * Math.sin(angle)
      };
      
      const hasReverse = nfa.edges.some(e => e.start === edge.end && e.end === edge.start);
      const isEpsilon = (Array.isArray(edge.text) && edge.text.includes("ε")) || edge.text === "ε";
      
      let curveFactor = 0;
      if (hasReverse) curveFactor = 25;
      else if (isEpsilon) curveFactor = 20;
      else curveFactor = 10;
      
      let pathStr, labelPos;
      if (Math.abs(curveFactor) < 5) {
        pathStr = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        labelPos = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
      } else {
        const edgeAngle = Math.atan2(end.y - start.y, end.x - start.x);
        const mid = {
          x: (start.x + end.x) / 2 + Math.sin(edgeAngle) * curveFactor,
          y: (start.y + end.y) / 2 - Math.cos(edgeAngle) * curveFactor
        };
        pathStr = `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;
        labelPos = { x: mid.x, y: mid.y };
      }
      
      const pathElem = newElementNS("path", [
        ["d", pathStr], ["fill", "none"],
        ["stroke", isEpsilon ? "#888" : "#333"], ["stroke-width", "2"],
        ["marker-end", "url(#arrowhead)"], ["opacity", "0.95"]
      ]);
      if (isEpsilon) pathElem.setAttribute("stroke-dasharray", "5,3");
      group.appendChild(pathElem);
      
      const labelStr = Array.isArray(edge.text) ? edge.text.join(", ") : edge.text;
      const edgeLabel = newElementNS("text", [
        ["fill", isEpsilon ? "#555" : "#222"], ["font-family", "Inter, sans-serif"],
        ["font-size", "12"], ["font-weight", "600"], ["text-anchor", "middle"],
        ["dominant-baseline", "middle"], ["x", labelPos.x], ["y", labelPos.y - 8]
      ]);
      edgeLabel.textContent = labelStr;
      group.appendChild(edgeLabel);
    }
  });

  // Draw nodes
  nodes.forEach(n => {
    const isSelected = selectedStates.has(n.text);
    
    let fillColor = "#fff";
    let strokeColor = "#222";
    let strokeWidth = "2";
    
    if (isSelected) {
      fillColor = "#e0f2fe";
      strokeColor = "#0277bd";
      strokeWidth = "3";
    }
    
    const circle = newElementNS("circle", [
      ["cx", n.x], ["cy", n.y], ["r", radius],
      ["stroke", strokeColor], ["fill", fillColor], ["stroke-width", strokeWidth],
      ["style", "cursor: pointer"]
    ]);
    
    // Add click handler for state selection
    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleStateSelection(n.text);
    });
    
    group.appendChild(circle);

    if (n.type === "accept") {
      const inner = newElementNS("circle", [
        ["cx", n.x], ["cy", n.y], ["r", radius - 6],
        ["stroke", strokeColor], ["stroke-width", "1.5"], ["fill", "none"]
      ]);
      group.appendChild(inner);
    }

    const label = newElementNS("text", [
      ["x", n.x], ["y", n.y + 2], ["fill", "#222"], ["text-anchor", "middle"],
      ["dominant-baseline", "middle"], ["font-family", "Inter, sans-serif"],
      ["font-weight", "700"], ["font-size", "14"], ["style", "pointer-events: none"]
    ]);
    label.textContent = n.text;
    group.appendChild(label);
  });

  // Draw start arrows
  nodes.filter(n => n.type === "start").forEach(n => {
    const startArrowPath = newElementNS("path", [
      ["d", `M ${n.x - radius - 30},${n.y} L ${n.x - radius - 5},${n.y}`],
      ["stroke", "#d97706"], ["stroke-width", "3"], ["marker-end", "url(#arrowhead)"]
    ]);
    group.appendChild(startArrowPath);
  });
}

// Display user's DFA construction on the right canvas
function displayDFA(canvas, userDFA) {
  clearElem(canvas);
  
  if (userDFA.states.length === 0) {
    const text = newElementNS("text", [
      ["x", width/2], ["y", height/2], ["fill", "#666"], ["text-anchor", "middle"],
      ["dominant-baseline", "middle"], ["font-family", "Inter, sans-serif"],
      ["font-size", "14"], ["font-style", "italic"]
    ]);
    text.textContent = "Your DFA will appear here";
    canvas.appendChild(text);
    return;
  }
  
  // Add arrowhead definition
  const defs = newElementNS("defs", []);
  const marker = newElementNS("marker", [
    ["id", "dfa-arrowhead"], ["markerWidth", "7"], ["markerHeight", "5"],
    ["refX", "6"], ["refY", "2.5"], ["orient", "auto"], ["markerUnits", "strokeWidth"]
  ]);
  const arrowPath = newElementNS("path", [
    ["d", "M0,0 L7,2.5 L0,5 L2,2.5 Z"], ["fill", "#1976d2"], ["stroke", "#1976d2"], ["stroke-width", "0.5"]
  ]);
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  canvas.appendChild(defs);

  // Auto-layout DFA states in a circle or grid
  const numStates = userDFA.states.length;
  const centerX = width / 2;
  const centerY = height / 2;
  const layoutRadius = Math.min(width, height) / 4; // Reduced radius to give more space
  
  userDFA.states.forEach((state, index) => {
    if (numStates === 1) {
      state.x = centerX;
      state.y = centerY;
    } else if (numStates <= 6) {
      // Circular layout
      const angle = (2 * Math.PI * index) / numStates - Math.PI / 2;
      state.x = centerX + layoutRadius * Math.cos(angle);
      state.y = centerY + layoutRadius * Math.sin(angle);
    } else {
      // Grid layout for many states
      const cols = Math.ceil(Math.sqrt(numStates));
      const col = index % cols;
      const row = Math.floor(index / cols);
      state.x = centerX + (col - (cols - 1) / 2) * 160; // Increased spacing
      state.y = centerY + (row - Math.floor((numStates - 1) / cols) / 2) * 140;
    }
  });

  // Draw transitions first (behind nodes)
  userDFA.transitions.forEach(transition => {
    const fromState = userDFA.states.find(s => s.name === transition.from);
    const toState = userDFA.states.find(s => s.name === transition.to);
    
    if (!fromState || !toState) return;
    
    if (fromState === toState) {
      // Self-loop
      const x = fromState.x;
      const y = fromState.y - radius - 15; // Moved further up
      const r = 20; // Larger radius for better visibility
      const pathStr = `M ${x} ${y} A ${r} ${r} 0 1 1 ${x - 0.1} ${y}`;
      
      const pathElem = newElementNS("path", [
        ["d", pathStr], ["fill", "none"], ["stroke", "#1976d2"], ["stroke-width", "2"],
        ["marker-end", "url(#dfa-arrowhead)"]
      ]);
      canvas.appendChild(pathElem);
      
      const label = newElementNS("text", [
        ["x", x], ["y", y - r - 12], ["fill", "#1976d2"], ["text-anchor", "middle"],
        ["dominant-baseline", "middle"], ["font-family", "Inter, sans-serif"],
        ["font-size", "12"], ["font-weight", "600"]
      ]);
      label.textContent = transition.symbol;
      canvas.appendChild(label);
    } else {
      // Regular transition
      const angle = Math.atan2(toState.y - fromState.y, toState.x - fromState.x);
      const start = {
        x: fromState.x + radius * Math.cos(angle),
        y: fromState.y + radius * Math.sin(angle)
      };
      const end = {
        x: toState.x - radius * Math.cos(angle),
        y: toState.y - radius * Math.sin(angle)
      };
      
      // Check for reverse transition to create curve
      const hasReverse = userDFA.transitions.some(t => 
        t.from === transition.to && t.to === transition.from
      );
      
      let pathStr, labelPos;
      if (hasReverse) {
        const curveFactor = 25;
        const edgeAngle = Math.atan2(end.y - start.y, end.x - start.x);
        const mid = {
          x: (start.x + end.x) / 2 + Math.sin(edgeAngle) * curveFactor,
          y: (start.y + end.y) / 2 - Math.cos(edgeAngle) * curveFactor
        };
        pathStr = `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;
        labelPos = { x: mid.x, y: mid.y - 8 };
      } else {
        pathStr = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        labelPos = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 - 8 };
      }
      
      const pathElem = newElementNS("path", [
        ["d", pathStr], ["fill", "none"], ["stroke", "#1976d2"], ["stroke-width", "2"],
        ["marker-end", "url(#dfa-arrowhead)"]
      ]);
      canvas.appendChild(pathElem);
      
      const label = newElementNS("text", [
        ["x", labelPos.x], ["y", labelPos.y], ["fill", "#1976d2"], ["text-anchor", "middle"],
        ["dominant-baseline", "middle"], ["font-family", "Inter, sans-serif"],
        ["font-size", "12"], ["font-weight", "600"]
      ]);
      label.textContent = transition.symbol;
      canvas.appendChild(label);
    }
  });

  // Draw nodes on top
  userDFA.states.forEach(state => {
    let fillColor = "#fff";
    let strokeColor = "#1976d2";
    let strokeWidth = "2";
    
    // Highlight for transition mode
    if (constructionMode === 'add_transition') {
      if (transitionSource && transitionSource.name === state.name) {
        // Source node - bright highlight
        fillColor = "#ffeb3b";
        strokeColor = "#f57f17";
        strokeWidth = "4";
      } else {
        // Other nodes - subtle highlight to indicate they're clickable
        fillColor = "#f5f5f5";
        strokeColor = "#1976d2";
        strokeWidth = "3";
      }
    } else {
      // Normal coloring
      if (state.isStart) {
        fillColor = "#e3f2fd";
        strokeWidth = "3";
      }
      if (state.isAccept) {
        strokeColor = "#2e7d32";
        if (!state.isStart) fillColor = "#e8f5e8";
      }
    }
    
    const circle = newElementNS("circle", [
      ["cx", state.x], ["cy", state.y], ["r", radius],
      ["stroke", strokeColor], ["fill", fillColor], ["stroke-width", strokeWidth],
      ["style", "cursor: pointer"]
    ]);
    
    // Add click handler for state modification
    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (constructionMode === 'add_transition') {
        handleTransitionClick(state);
      } else {
        // Toggle accept state
        const wasAccept = state.isAccept;
        state.isAccept = !state.isAccept;
        
        // Save undo action
        saveUndoAction(ACTION_TYPES.TOGGLE_ACCEPT, {
          stateName: state.name,
          wasAccept: wasAccept
        });
        
        refreshDFACanvas();
        addConstructionStep(`Toggled accept status for ${state.name}`);
      }
    });
    
    canvas.appendChild(circle);

    // Double circle for accept states
    if (state.isAccept) {
      const inner = newElementNS("circle", [
        ["cx", state.x], ["cy", state.y], ["r", radius - 6],
        ["stroke", strokeColor], ["stroke-width", "1.5"], ["fill", "none"]
      ]);
      canvas.appendChild(inner);
    }

    // State label - abbreviated for long names
    let displayName = state.name;
    if (displayName.length > 18) {
      displayName = displayName.substring(0, 16) + "...";
    }
    
    const label = newElementNS("text", [
      ["x", state.x], ["y", state.y + 2], ["fill", "#222"], ["text-anchor", "middle"],
      ["dominant-baseline", "middle"], ["font-family", "Inter, sans-serif"],
      ["font-weight", "700"], ["font-size", "12"], ["style", "pointer-events: none"]
    ]);
    label.textContent = displayName;
    canvas.appendChild(label);
  });

  // Draw start arrows
  userDFA.states.filter(s => s.isStart).forEach(state => {
    const startArrowPath = newElementNS("path", [
      ["d", `M ${state.x - radius - 30},${state.y} L ${state.x - radius - 5},${state.y}`],
      ["stroke", "#e53935"], ["stroke-width", "3"], ["marker-end", "url(#dfa-arrowhead)"]
    ]);
    canvas.appendChild(startArrowPath);
  });
}

// --- Interactive Functions ---

// Toggle state selection for creating DFA states
function toggleStateSelection(stateName) {
  if (selectedStates.has(stateName)) {
    selectedStates.delete(stateName);
  } else {
    selectedStates.add(stateName);
  }
  refreshNFACanvas();
  
  if (selectedStates.size > 0) {
    const selectedArray = Array.from(selectedStates).sort();
    const stateSetName = stateSetToString(selectedArray);
    document.getElementById("add_state").textContent = `Create: ${stateSetName}`;
  } else {
    document.getElementById("add_state").textContent = "Add State";
  }
}

// Handle transition click for DFA construction
function handleTransitionClick(state) {
  if (!transitionSource) {
    transitionSource = state;
    addConstructionStep(`Selected ${state.name} as transition source (highlighted in yellow). Click again for self-loop or click another state.`);
    // Refresh to show highlighting
    refreshDFACanvas();
  } else if (transitionSource === state) {
    // Same state clicked - create self-loop
    createTransitionDialog(transitionSource, state);
  } else {
    // Different state - create regular transition
    createTransitionDialog(transitionSource, state);
  }
}

// Create dialog for transition symbol input
function createTransitionDialog(fromState, toState) {
  const currentNFA = automata[automataIndex];
  const alphabet = currentNFA.alphabet;
  
  swal({
    title: "Add Transition",
    text: `From ${fromState.name} to ${toState.name}\nChoose alphabet symbol:`,
    content: {
      element: "select",
      attributes: {
        multiple: false,
      },
    },
    buttons: ["Cancel", "Add"],
  }).then(value => {
    if (value) {
      // Get the selected symbol from the dropdown
      const select = document.querySelector('.swal-content select');
      const symbol = select.value;
      
      if (symbol) {
        // Check if transition already exists
        const existingTransition = userDFA.transitions.find(t => 
          t.from === fromState.name && t.symbol === symbol
        );
        
        if (existingTransition) {
          swal("Transition exists!", `Transition from ${fromState.name} on '${symbol}' already exists to ${existingTransition.to}`, "warning");
        } else {
          userDFA.transitions.push({
            from: fromState.name,
            to: toState.name,
            symbol: symbol
          });
          
          // Save undo action
          saveUndoAction(ACTION_TYPES.ADD_TRANSITION, {
            from: fromState.name,
            to: toState.name,
            symbol: symbol
          });
          
          addConstructionStep(`Added transition: ${fromState.name} --${symbol}--> ${toState.name}`);
          refreshDFACanvas();
        }
      }
    }
    
    // Reset transition mode
    transitionSource = null;
    constructionMode = 'none';
    document.getElementById("add_transition").textContent = "Add Transition";
    refreshDFACanvas();
  });
  
  // Populate the select with alphabet symbols
  setTimeout(() => {
    const select = document.querySelector('.swal-content select');
    if (select) {
      alphabet.forEach(symbol => {
        const option = document.createElement('option');
        option.value = symbol;
        option.textContent = symbol;
        select.appendChild(option);
      });
    }
  }, 100);
}

// Create DFA state from selected NFA states
function createDFAState() {
  if (selectedStates.size === 0) {
    swal("No states selected!", "Please click on NFA states to select them first.", "warning");
    return;
  }
  
  const selectedArray = Array.from(selectedStates).sort();
  const stateSetName = stateSetToString(selectedArray);
  
  // Check if state already exists
  if (userDFA.states.find(s => s.name === stateSetName)) {
    swal("State exists!", `DFA state ${stateSetName} already exists.`, "warning");
    return;
  }
  
  // Compute epsilon closure of selected states
  const currentNFA = automata[automataIndex];
  const epsilonClosureStates = epsilonClosure(selectedArray, currentNFA);
  const finalStateSetName = stateSetToString(epsilonClosureStates);
  
  // Check if epsilon closure creates a different state
  if (finalStateSetName !== stateSetName) {
    swal({
      title: "ε-closure computed",
      text: `Selected: ${stateSetName}\nε-closure: ${finalStateSetName}\nCreate the ε-closure state?`,
      buttons: ["Cancel", "Create ε-closure"],
    }).then(value => {
      if (value) {
        createDFAStateInternal(finalStateSetName, epsilonClosureStates, currentNFA);
      }
    });
  } else {
    createDFAStateInternal(stateSetName, selectedArray, currentNFA);
  }
  
  // Clear selection
  selectedStates.clear();
  refreshNFACanvas();
  document.getElementById("add_state").textContent = "Add State";
}

// Internal function to create DFA state
function createDFAStateInternal(stateName, nfaStates, nfa) {
  // Check if this should be the start state
  const startNFAState = nfa.vertices.find(v => v.type === "start");
  const startClosure = epsilonClosure([startNFAState.text], nfa);
  const isStart = JSON.stringify(nfaStates.sort()) === JSON.stringify(startClosure.sort());
  
  // Check if this should be an accept state
  const isAccept = isAcceptingState(nfaStates, nfa);
  
  const newState = {
    name: stateName,
    isStart: isStart,
    isAccept: isAccept,
    nfaStates: nfaStates,
    x: 0, y: 0 // Will be set by layout function
  };
  
  userDFA.states.push(newState);
  
  // Save undo action
  saveUndoAction(ACTION_TYPES.CREATE_STATE, {
    stateName: stateName
  });
  
  let stateType = [];
  if (isStart) stateType.push("start");
  if (isAccept) stateType.push("accept");
  const typeStr = stateType.length > 0 ? ` (${stateType.join(", ")})` : "";
  
  addConstructionStep(`Created DFA state ${stateName}${typeStr} from NFA states {${nfaStates.join(', ')}}`);
  refreshDFACanvas();
}

// Core refresh functions
function refreshNFACanvas() {
  const canvas = document.getElementById("nfa_canvas");
  if (!canvas) return;
  
  const parent = canvas.parentElement;
  let w = parent ? parent.offsetWidth || 800 : 800;
  let h = Math.max(250, Math.round(w / 3.2)); // Increased height ratio for better fit
  canvas.setAttribute("width", w);
  canvas.setAttribute("height", h);
  width = w;
  height = h;

  const currentNFA = automata[automataIndex];
  if (currentNFA) {
    document.getElementById("NFA_description").textContent = currentNFA.description || "";
    displayNFA(canvas, currentNFA);
  }
}

function refreshDFACanvas() {
  const canvas = document.getElementById("dfa_canvas");
  if (!canvas) return;
  
  const parent = canvas.parentElement;
  let w = parent ? parent.offsetWidth || 800 : 800;
  let h = Math.max(350, Math.round(w / 2.3)); // Increased height for DFA with self-loops
  canvas.setAttribute("width", w);
  canvas.setAttribute("height", h);
  width = w;
  height = h;

  displayDFA(canvas, userDFA);
}

function refreshAll() {
  refreshNFACanvas();
  refreshDFACanvas();
}

function refreshInput() {
  const inputContainer = document.getElementById("input_container");
  clearElem(inputContainer);
  const inputData = automata[automataIndex]["input"][inputIndex];
  if (!inputData) return; // Safeguard if inputData is undefined
  const inputStr = inputData["string"];

  for (let i = 0; i < inputStr.length; ++i) {
    let className = "input-char font-bold text-black transition-all";
    if (inputPointer === i) {
      className += " bg-yellow-200 rounded scale-110";
    }
    const span = document.createElement("span");
    span.id = `text_${i}`;
    span.className = className;
    span.textContent = inputStr[i];
    inputContainer.appendChild(span);
    if (i < inputStr.length - 1) {
      inputContainer.appendChild(document.createTextNode(" "));
    }
  }
  // Show "ε" for empty string or initial state
  if (inputStr.length === 0 && inputPointer === 0) {
    const span = document.createElement("span");
    span.className = "input-char font-bold text-black bg-yellow-200 rounded scale-110";
    span.textContent = "ε (start)";
    inputContainer.appendChild(span);
  }
  updateButtonStates();
}

function resetStack() {
  const stack = document.getElementById("trace_list"); // Changed id to trace_list for clarity
  if (stack) {
    clearElem(stack); // Use clearElem helper
  }
  // Add initial state to stack
  const initialStates = automata[automataIndex]["input"][inputIndex]["states"][0];
  addToStack(`Step 0: Initial states: {${initialStates.join(', ')}}`);
}

function addToStack(str) {
  const stack = document.getElementById("trace_list");
  if (!stack) return;

  // Un-bold any currently bold item
  Array.from(stack.children).forEach(li => {
    li.style.fontWeight = "normal";
  });

  const listElem = document.createElement("li");
  listElem.textContent = str;
  listElem.style.fontWeight = "bold"; // Make new item bold

  stack.prepend(listElem); // Add new trace at the top
}

function removeFromStack() {
  const stack = document.getElementById("trace_list");
  if (!stack || stack.children.length === 0) return;

  stack.removeChild(stack.firstElementChild); // Remove the top (most recent) element

  // If there are still elements, bold the new top one
  if (stack.firstElementChild) {
    stack.firstElementChild.style.fontWeight = "bold";
  }
}


// --- NFA to DFA Conversion Functions ---

// Compute epsilon closure of a set of states
function epsilonClosure(states, nfa) {
  const closure = new Set(states);
  const stack = [...states];
  
  while (stack.length > 0) {
    const current = stack.pop();
    
    // Find all epsilon transitions from current state
    nfa.edges.forEach(edge => {
      if (edge.start === current && 
          (edge.text === "ε" || (Array.isArray(edge.text) && edge.text.includes("ε")))) {
        if (!closure.has(edge.end)) {
          closure.add(edge.end);
          stack.push(edge.end);
        }
      }
    });
  }
  
  return Array.from(closure).sort();
}

// Get transitions from a set of NFA states on a given symbol
function getTransitions(nfaStates, symbol, nfa) {
  const resultStates = new Set();
  
  nfaStates.forEach(state => {
    nfa.edges.forEach(edge => {
      if (edge.start === state && 
          (edge.text === symbol || (Array.isArray(edge.text) && edge.text.includes(symbol)))) {
        resultStates.add(edge.end);
      }
    });
  });
  
  return epsilonClosure(Array.from(resultStates), nfa);
}

// Check if a set of NFA states contains an accept state
function isAcceptingState(nfaStates, nfa) {
  return nfaStates.some(state => {
    const vertex = nfa.vertices.find(v => v.text === state);
    return vertex && vertex.type === "accept";
  });
}

// Convert state set to string representation
function stateSetToString(states) {
  return `{${states.sort().join(',')}}`;
}

// Parse state string back to array
function stringToStateSet(stateStr) {
  const match = stateStr.match(/\{([^}]*)\}/);
  if (!match || !match[1]) return [];
  return match[1].split(',').map(s => s.trim()).filter(s => s);
}

// Validate user's DFA construction
function validateDFA() {
  const currentNFA = automata[automataIndex];
  const userStates = userDFA.states;
  const userTransitions = userDFA.transitions;
  
  if (userStates.length === 0) {
    swal("No states!", "Please add some states to your DFA first.", "warning");
    return;
  }

  // Perform automatic powerset construction for comparison
  const correctDFA = constructCorrectDFA(currentNFA);
  
  // Check if user's DFA is equivalent to correct one
  const validation = compareDFAs(userDFA, correctDFA, currentNFA);
  
  if (validation.isCorrect) {
    swal({
      title: "🎉 Excellent!",
      text: `Your DFA construction is correct! You successfully converted the NFA using powerset construction. ${validation.message}`,
      icon: "success",
      buttons: {
        next: "Try Next NFA",
        stay: "Study This One"
      }
    }).then(value => {
      if (value === "next") {
        automataIndex = (automataIndex + 1) % automata.length;
        resetConstruction();
        refreshAll();
      }
    });
  } else {
    swal({
      title: "Not quite right",
      text: `${validation.message}\n\nHint: ${validation.hint}`,
      icon: "error",
      button: "Try Again"
    });
  }
}

// Construct the correct DFA for comparison
function constructCorrectDFA(nfa) {
  const alphabet = nfa.alphabet;
  const startState = nfa.vertices.find(v => v.type === "start");
  const startClosure = epsilonClosure([startState.text], nfa);
  
  const dfaStates = [];
  const dfaTransitions = [];
  const stateQueue = [startClosure];
  const processedStates = new Set();
  
  while (stateQueue.length > 0) {
    const currentStateSet = stateQueue.shift();
    const stateString = stateSetToString(currentStateSet);
    
    if (processedStates.has(stateString)) continue;
    processedStates.add(stateString);
    
    // Create DFA state
    const isStart = JSON.stringify(currentStateSet.sort()) === JSON.stringify(startClosure.sort());
    const isAccept = isAcceptingState(currentStateSet, nfa);
    
    dfaStates.push({
      name: stateString,
      isStart,
      isAccept,
      nfaStates: currentStateSet
    });
    
    // Create transitions for each alphabet symbol
    alphabet.forEach(symbol => {
      const nextStateSet = getTransitions(currentStateSet, symbol, nfa);
      if (nextStateSet.length > 0) {
        const nextStateString = stateSetToString(nextStateSet);
        
        dfaTransitions.push({
          from: stateString,
          to: nextStateString,
          symbol: symbol
        });
        
        // Add new state to queue if not processed
        if (!processedStates.has(nextStateString)) {
          stateQueue.push(nextStateSet);
        }
      }
    });
  }
  
  return { states: dfaStates, transitions: dfaTransitions };
}

// Compare user's DFA with correct DFA
function compareDFAs(userDFA, correctDFA, nfa) {
  const userStateNames = new Set(userDFA.states.map(s => s.name));
  const correctStateNames = new Set(correctDFA.states.map(s => s.name));
  
  // Check if all correct states are present
  const missingStates = correctDFA.states.filter(s => !userStateNames.has(s.name));
  const extraStates = userDFA.states.filter(s => !correctStateNames.has(s.name));
  
  if (missingStates.length > 0) {
    const missing = missingStates.map(s => s.name).join(', ');
    return {
      isCorrect: false,
      message: `Missing required DFA states: ${missing}`,
      hint: "Use powerset construction: start with ε-closure of the initial state, then compute transitions."
    };
  }
  
  if (extraStates.length > 0) {
    const extra = extraStates.map(s => s.name).join(', ');
    return {
      isCorrect: false,
      message: `Extra unnecessary states: ${extra}`,
      hint: "Only include reachable states from the start state."
    };
  }
  
  // Check start and accept state markings
  const userStartStates = userDFA.states.filter(s => s.isStart);
  const correctStartStates = correctDFA.states.filter(s => s.isStart);
  
  if (userStartStates.length !== 1) {
    return {
      isCorrect: false,
      message: `DFA must have exactly one start state, found ${userStartStates.length}`,
      hint: "Mark the ε-closure of the NFA's start state as the DFA's start state."
    };
  }
  
  if (userStartStates[0].name !== correctStartStates[0].name) {
    return {
      isCorrect: false,
      message: `Wrong start state. Expected: ${correctStartStates[0].name}`,
      hint: "The start state should be the ε-closure of the NFA's initial state."
    };
  }
  
  // Check accept states
  const userAcceptNames = new Set(userDFA.states.filter(s => s.isAccept).map(s => s.name));
  const correctAcceptNames = new Set(correctDFA.states.filter(s => s.isAccept).map(s => s.name));
  
  const missingAccept = correctDFA.states.filter(s => s.isAccept && !userAcceptNames.has(s.name));
  const extraAccept = userDFA.states.filter(s => s.isAccept && !correctAcceptNames.has(s.name));
  
  if (missingAccept.length > 0 || extraAccept.length > 0) {
    return {
      isCorrect: false,
      message: "Incorrect accept state markings",
      hint: "A DFA state is accepting if it contains at least one NFA accept state."
    };
  }
  
  // Check transitions
  const userTransitionMap = new Map();
  userDFA.transitions.forEach(t => {
    const key = `${t.from}:${t.symbol}`;
    userTransitionMap.set(key, t.to);
  });
  
  const correctTransitionMap = new Map();
  correctDFA.transitions.forEach(t => {
    const key = `${t.from}:${t.symbol}`;
    correctTransitionMap.set(key, t.to);
  });
  
  for (let [key, correctTo] of correctTransitionMap) {
    const userTo = userTransitionMap.get(key);
    if (userTo !== correctTo) {
      const [from, symbol] = key.split(':');
      if (userTo) {
        return {
          isCorrect: false,
          message: `Wrong transition from ${from} on '${symbol}' to ${userTo}. You need to transition from ${from} on '${symbol}' to ${correctTo}.`,
          hint: "For each DFA state and symbol, compute where the NFA states would go, then take ε-closure."
        };
      } else {
        return {
          isCorrect: false,
          message: `Missing transition! You need to add a transition from ${from} on '${symbol}' to ${correctTo}.`,
          hint: "For each DFA state and symbol, compute where the NFA states would go, then take ε-closure."
        };
      }
    }
  }
  
  return {
    isCorrect: true,
    message: `Perfect! Your DFA has ${correctDFA.states.length} states and ${correctDFA.transitions.length} transitions.`
  };
}

// Reset the DFA construction
function resetConstruction() {
  userDFA = { states: [], transitions: [], startState: null, acceptStates: [] };
  constructionSteps = [];
  selectedStates.clear();
  constructionMode = 'none';
  transitionSource = null;
  undoStack = []; // Clear undo stack
  
  // Clear construction steps display
  const stepsList = document.getElementById("construction_steps");
  if (stepsList) {
    clearElem(stepsList);
  }
  
  updateUndoButton();
  refreshDFACanvas();
}

// Add construction step to log
function addConstructionStep(message) {
  constructionSteps.push(message);
  const stepsList = document.getElementById("construction_steps");
  if (stepsList) {
    const li = document.createElement("li");
    li.textContent = `${constructionSteps.length}. ${message}`;
    li.className = "text-gray-700 font-medium";
    stepsList.appendChild(li);
    
    // Scroll to bottom
    stepsList.scrollTop = stepsList.scrollHeight;
  }
}

// Show hint about expected DFA structure
function showHint() {
  const currentNFA = automata[automataIndex];
  const expectedDFA = currentNFA.expectedDFA;
  
  if (!expectedDFA) {
    swal("No hint available", "Expected DFA structure not defined for this NFA.", "info");
    return;
  }
  
  let hintText = "Expected DFA Structure:\n\n";
  
  // States
  hintText += "States:\n";
  expectedDFA.states.forEach(state => {
    let stateInfo = `• ${state.name}`;
    let properties = [];
    if (state.isStart) properties.push("start");
    if (state.isAccept) properties.push("accept");
    if (properties.length > 0) {
      stateInfo += ` (${properties.join(", ")})`;
    }
    stateInfo += ` ← from NFA states {${state.nfaStates.join(', ')}}`;
    hintText += stateInfo + "\n";
  });
  
  // Transitions
  hintText += "\nTransitions:\n";
  expectedDFA.transitions.forEach(transition => {
    hintText += `• ${transition.from} --${transition.symbol}--> ${transition.to}\n`;
  });
  
  swal({
    title: "💡 DFA Construction Hint",
    text: hintText,
    icon: "info",
    button: "Got it!",
    content: {
      element: "div",
      attributes: {
        innerHTML: hintText.replace(/\n/g, '<br>').replace(/•/g, '&bull;')
      }
    }
  });
}

// Event Handlers for NFA to DFA Conversion
window.addEventListener('load', function (e) {
  refreshAll();

  // Change NFA button
  document.getElementById("change_nfa").addEventListener("click", function () {
    automataIndex = (automataIndex + 1) % automata.length;
    resetConstruction();
    refreshAll();
    addConstructionStep(`Loaded NFA ${automataIndex + 1}: ${automata[automataIndex].description}`);
  });

  // Reset construction button
  document.getElementById("reset_construction").addEventListener("click", function () {
    swal({
      title: "Reset Construction?",
      text: "This will clear all your DFA states and transitions.",
      icon: "warning",
      buttons: ["Cancel", "Reset"],
      dangerMode: true,
    }).then(value => {
      if (value) {
        resetConstruction();
        addConstructionStep("Construction reset");
      }
    });
  });

  // Add state button - creates DFA state from selected NFA states
  document.getElementById("add_state").addEventListener("click", function () {
    createDFAState();
  });

  // Add transition button - toggles transition mode
  document.getElementById("add_transition").addEventListener("click", function () {
    if (userDFA.states.length < 1) {
      swal("Need states!", "Create at least 1 DFA state before adding transitions.", "warning");
      return;
    }
    
    if (constructionMode === 'add_transition') {
      constructionMode = 'none';
      transitionSource = null;
      document.getElementById("add_transition").textContent = "Add Transition";
      addConstructionStep("Cancelled transition mode");
    } else {
      constructionMode = 'add_transition';
      document.getElementById("add_transition").textContent = "Cancel Transition";
      addConstructionStep("Transition mode: Click source state (highlighted yellow), then target state (same state = self-loop)");
    }
    refreshDFACanvas();
  });

  // Undo button
  document.getElementById("undo_action").addEventListener("click", function () {
    performUndo();
  });

  // Validate DFA button
  document.getElementById("validate_dfa").addEventListener("click", function () {
    validateDFA();
  });

  // Hint button
  document.getElementById("show_hint").addEventListener("click", function () {
    showHint();
  });

  // Undo action button
  document.getElementById("undo_action").addEventListener("click", function () {
    performUndo();
  });

  // Clear NFA state selection when clicking outside
  document.getElementById("nfa_canvas").addEventListener("click", function(e) {
    if (e.target === e.currentTarget) {
      selectedStates.clear();
      refreshNFACanvas();
      document.getElementById("add_state").textContent = "Add State";
    }
  });

  // Clear DFA selection when clicking outside
  document.getElementById("dfa_canvas").addEventListener("click", function(e) {
    if (e.target === e.currentTarget && constructionMode === 'add_transition') {
      transitionSource = null;
      constructionMode = 'none';
      document.getElementById("add_transition").textContent = "Add Transition";
      refreshDFACanvas();
      addConstructionStep("Cancelled transition creation");
    }
  });

  // Add responsive canvas resize functionality
  function resizeCanvases() {
    refreshAll();
  }
  
  window.addEventListener('resize', resizeCanvases);
  
  // Initial setup
  updateUndoButton(); // Initialize undo button state
  addConstructionStep(`Loaded NFA 1: ${automata[0].description}`);
  addConstructionStep("Click NFA states to select them, then click 'Add State'");
});