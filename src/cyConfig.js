const config = {
  container: undefined,
  headless: true,
  elements: [],
  layout: {
    name: 'preset',
  },

  style: [
    {
      selector: 'node',
      style: {
        'font-family': ['B612', 'sans-serif'],
        label: 'data(name)',
        shape: 'rectangle',
        width: 100,
        height: 40,
        'text-valign': 'center',
        'background-color': 'hsla(0, 0%, 0%, 0.85)',
        color: 'hsl(30, 47%, 86%)',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': 'hsl(30, 47%, 86%)',
        color: 'hsla(0, 0%, 0%, 0.85)',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 6,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': 'hsla(0, 0%, 0%, 0.85)',
        'target-arrow-color': 'hsla(0, 0%, 0%, 0.85)',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        width: 6,
        'curve-style': 'bezier',
        'line-color': 'hsl(30, 47%, 86%)',
        'target-arrow-color': 'hsl(30, 47%, 86%)',
      },
    },
  ],

  wheelSensitivity: 0.05,
  selectionType: 'single',
}

export default config
