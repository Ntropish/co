declare interface Frame {
  name: string
  schedule: Symbol
  children: Symbol[]
  puts: any[]
  takes: any[]
}

declare module 'cytoscape-cxtmenu'
