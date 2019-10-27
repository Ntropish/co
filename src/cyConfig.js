const config = ({ $obj, $port }) => ({
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
        label: function(ele) {
          const data = ele.data()
          if (data._source && data._target) {
            return getLabel(data._source) + ' ⟶ ' + getLabel(data._target)
          } else if (data._source) {
            return getLabel(data._source)
          } else if (data._target) {
            return getLabel(data._target)
          } else {
            return data.emoji
          }
          function getLabel(sourceOrTarget) {
            const it = sourceOrTarget

            if (it.type === 'object') {
              const obj = $obj.store.s[it.object]
              const port = $port.s[it.port]
              return obj.name + ' ' + port.name
            } else if (it.type === 'port') {
              const port = $port.s[it.port]
              return port.name
            } else if (it.type === 'value') {
              const obj = $obj.store.s[it.object]
              return obj.values[it.index][0]
            }
          }
        },
        width: function(ele) {
          return 'label'
        },
        height: function(ele) {
          return 'label'
        },
        shape: 'rectangle',
        'text-valign': 'center',
        'background-color': 'hsl(185, 9%, 15%)',
        color: 'hsl(30, 47%, 86%)',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': 'hsl(30, 47%, 86%)',
        color: 'hsl(185, 9%, 25%)',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'curve-style': 'taxi',
        'target-arrow-shape': 'triangle',

        'line-color': 'hsl(30, 47%, 86%)',
        'target-arrow-color': 'hsl(30, 47%, 86%)',
        // 'target-arrow-fill': 'hollow',
        'source-distance-from-node': '20px',
        'target-distance-from-node': '20px',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': 'hsla(0, 0%, 0%, 0.85)',
        'target-arrow-color': 'hsla(0, 0%, 0%, 0.85)',
      },
    },
  ],

  wheelSensitivity: 0.05,
  selectionType: 'single',
  zoom: 3,
})

export default config
