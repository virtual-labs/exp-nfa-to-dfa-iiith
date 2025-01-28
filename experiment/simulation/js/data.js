
const nfa1 = {
  "vertices": [
    {"text": "A", "type": "start"},
    {"text": "B", "type": "none"},
    {"text": "C", "type": "accept"}
  ],
  "edges": [
    {"start": "A", "end": "A", "text": "0", "type": "self"},
    {"start": "A", "end": "B", "text": "1", "type": "forward"},
    {"start": "B", "end": "B", "text": "0,1", "type": "self"},
    {"start": "B", "end": "C", "text": "0", "type": "forward"},
    {"start": "C", "end": "C", "text": "0,1", "type": "self"},
    {"start": "C", "end": "B", "text": "1", "type": "backward"}
  ],
  "input": [
    {
      "string": "1010",
      "states": ["A", "B", "C", "B", "C"],
      "reject_path": ["A", "B", "C", "B", "B"]
    },
    {
      "string": "0110",
      "states": ["A", "A", "B", "B", "C"],
      "reject_path": ["A", "A", "B", "B", "B"]
    },
    {
      "string": "1100",
      "states": ["A", "B", "B", "C", "C"],
      "reject_path": ["A", "B", "B", "B", "B"]
    }
  ],
  "Explanation": [
    {
      "string": "Steps for Converting NFA to DFA"
    }
  ]
}

const dfa1 = {
  "vertices": [
    {"text": "a", "type": "start"},
    {"text": "b", "type": "none"},
    {"text": "c", "type": "accept"}
  ],
  "edges": [
    {"start": "a", "end": "a", "text": "0", "type": "self"},
    {"start": "a", "end": "b", "text": "1", "type": "forward"},
    {"start": "b", "end": "b", "text": "1", "type": "self"},
    {"start": "b", "end": "c", "text": "0", "type": "forward"},
    {"start": "c", "end": "c", "text": "0,1", "type": "self"},
  ],
  "input": [
    {
      "string": "1010",
      "states": ["a", "b", "c", "c", "c"]
    },
    {
      "string": "0110",
      "states": ["a", "a", "b", "b", "c"]
    },
    {
      "string": "1100",
      "states": ["a", "b", "b", "c", "c"]
    }
  ]
}

const nfa2 = {
  "vertices": [
    {"text": "A", "type": "start"},
    {"text": "B", "type": "none"},
    {"text": "C", "type": "accept"},
  ],
  "edges": [
    {"start": "A", "end": "A", "text": "0,1", "type": "self"},
    {"start": "A", "end": "B", "text": "0", "type": "forward"},
    {"start": "B", "end": "C", "text": "1", "type": "forward"},
    {"start": "C", "end": "C", "text": "1", "type": "self"}
  ],
  "input": [
    {
      "string": "10011",
      "states": ["A", "A", "A", "B", "C", "C"],
      "reject_path": ["A", "A", "A", "A", "A", "B"]
    },
    {
      "string": "0101",
      "states": ["A", "A", "A", "B", "C"],
      "reject_path": ["A", "A", "A", "A", "A"]
    },
    {
      "string": "10101",
      "states": ["A", "A", "A", "A", "B", "C"],
      "reject_path": ["A", "A", "A", "A", "A", "A"]
    }
  ],
  "Explanation": [
    {
      "string": "Steps for Converting NFA to DFA"
    }
  ]
}

const dfa2 = {
  "vertices": [
    {"text": "a", "type": "start"},
    {"text": "b", "type": "none"},
    {"text": "c", "type": "accept"}
  ],
  "edges": [
    {"start": "a", "end": "a", "text": "1", "type": "self"},
    {"start": "a", "end": "b", "text": "0", "type": "forward"},
    {"start": "b", "end": "c", "text": "1", "type": "forward"},
    {"start": "b", "end": "b", "text": "0", "type": "self"},
    {"start": "c", "end": "b", "text": "0", "type": "backward"},
    {"start": "c", "end": "c", "text": "1", "type": "self"}
  ],
  "input": [
    {
      "string": "10011",
      "states": ["a", "a", "b", "b", "c", "c"]
    },
    {
      "string": "0101",
      "states": ["a", "b", "c", "b", "c"]
    },
    {
      "string": "10101",
      "states": ["a", "a", "b", "c", "b", "c"]
    }
  ]
}

// const nfa3 = {
//   "vertices": [
//
//   ],
//   "edges": [
//
//   ],
//   "input": [
//     {
//       "string": "1000",
//       "states": ["A"],
//       "reject_path": ["A"]
//     },
//     {
//       "string": "00010",
//       "states": ["A"],
//       "reject_path": ["A"]
//     },
//     {
//       "string": "",
//       "states": ["A"],
//       "reject_path": ["A"]
//     }
//   ]
// }
//
// const dfa3 = {
//   "vertices": [
//     {"text": "a", "type": "start"},
//     {"text": "b", "type": "none"},
//     {"text": "c", "type": "none"},
//     {"text": "d", "type": "accept"}
//   ],
//   "edges": [
//     {"start": "a", "end": "a", "text": "1", "type": "self"},
//     {"start": "a", "end": "b", "text": "0", "type": "forward"},
//     {"start": "b", "end": "c", "text": "0", "type": "forward"},
//     {"start": "c", "end": "d", "text": "0", "type": "forward"},
//     {"start": "d", "end": "d", "text": "0,1", "type": "self"}
//   ],
//   "input": [
//     {
//       "string": "1000",
//       "states": ["a", "a", "b", "c", "d"]
//     },
//     {
//       "string": "00010",
//       "states": ["a", "b", "c", "d", "d", "d"]
//     },
//     {
//       "string": "0001",
//       "states": ["a", "b", "c", "d", "d"]
//     }
//   ]
// }
