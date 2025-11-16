# NFA to DFA Conversion using Subset Construction

## Introduction

This experiment demonstrates the conversion of Non-deterministic Finite Automata (NFA) to equivalent Deterministic Finite Automata (DFA) using the subset construction algorithm. Students will learn how to systematically convert NFAs with non-deterministic transitions and epsilon moves to equivalent DFAs that can be directly implemented.

## Learning Objectives

By the end of this experiment, students will be able to:

1. Understand the difference between NFAs and DFAs
2. Apply the subset construction algorithm to convert NFAs to DFAs
3. Calculate epsilon closures for sets of states
4. Construct transition tables for the resulting DFA
5. Identify accepting states in the converted DFA
6. Understand the concept of DFA minimization
7. Analyze the complexity implications of NFA to DFA conversion

## Theory

### Non-deterministic Finite Automaton (NFA)

An NFA is a 5-tuple (Q, Σ, δ, q₀, F) where:
- Q is a finite set of states
- Σ is a finite alphabet
- δ: Q × (Σ ∪ {ε}) → P(Q) is the transition function
- q₀ ∈ Q is the initial state
- F ⊆ Q is the set of accepting states

### Subset Construction Algorithm

The subset construction algorithm converts an NFA N to an equivalent DFA D by:
1. Creating DFA states that represent subsets of NFA states
2. Computing epsilon closures to handle ε-transitions
3. Defining transitions based on the move function
4. Determining accepting states based on NFA accepting states

## Simulation Features

- **Interactive NFA Examples**: Multiple pre-defined NFAs with different characteristics
- **Step-by-Step Conversion**: Visual demonstration of each step in the subset construction
- **Epsilon Closure Calculation**: Shows how epsilon closures are computed
- **DFA Visualization**: Graphical representation of both NFAs and resulting DFAs
- **Minimization Process**: Optional demonstration of DFA minimization
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## File Structure

```
exp-nfa-to-dfa-iiith/
├── experiment/
│   ├── aim.md
│   ├── experiment-name.md
│   ├── theory.md
│   ├── procedure.md
│   ├── references.md
│   ├── contributors.md
│   ├── README.md
│   ├── pretest.json
│   ├── posttest.json
│   ├── images/
│   └── simulation/
│       ├── index.html
│       ├── css/
│       │   └── main.css
│       ├── js/
│       │   └── main.js
│       └── images/
```

## Usage Instructions

1. Open the simulation by accessing the index.html file
2. Select an NFA example from the dropdown menu
3. Click "Convert NFA to DFA" to start the conversion process
4. Use navigation buttons to step through the conversion process
5. Observe the resulting DFA and compare with the original NFA
6. Optionally explore DFA minimization features

## Technical Requirements

- Modern web browser with JavaScript enabled
- No additional plugins or software required
- Responsive design supports mobile and desktop viewing

## Assessment

The experiment includes:
- **Pretest**: 9 questions covering basic NFA/DFA concepts
- **Posttest**: 9 questions testing understanding of conversion algorithms
- Questions are categorized by difficulty: Beginner, Intermediate, Advanced

## Educational Value

This experiment provides:
- Hands-on experience with fundamental automata theory concepts
- Visual understanding of abstract mathematical concepts
- Step-by-step learning approach
- Immediate feedback and validation
- Practical application of theoretical knowledge

## Version Information

- **Version**: 1.0
- **Last Updated**: 2024
- **Compatibility**: Modern web browsers
- **Mobile Support**: Fully responsive design

## Contributing

This experiment is part of the Virtual Labs project. For contributions or issues, please follow the Virtual Labs contribution guidelines.

## License

This experiment is released under the Virtual Labs license terms. 