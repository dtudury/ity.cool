import { proxy } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'

export const model = (window.model = proxy());
(async () => {
  const lat = await (await fetch("lat.json")).json();
  lat.forEach(({ lattice }) => {
    const graph = [];
    for (const i in lattice) {
      const edges = lattice[i];
      for (const edge of edges) {
        const { from_state, to_state } = edge;
        if (from_state == null || to_state == null) break;
        if (!graph[from_state]) {
          graph[from_state] = { i: from_state, in: [], out: [] };
        }
        if (!graph[to_state]) {
          graph[to_state] = { i: to_state, in: [], out: [] };
        }
        const dt = edge.transitions.reduce((a, { length }) => a + length, 0);
        graph[from_state].out.push({ i: to_state, edge, dt });
        graph[to_state].in.push({ i: from_state, edge, dt });
      }
    }
    calculateTimes(0, graph);
    console.log(graph);
    const nodesByTime = {};
    graph.forEach(node => {
      const t = node.t;
      nodesByTime[t] = nodesByTime[t] || [];
      nodesByTime[t].push(node);
    });
    console.log(nodesByTime);
  });
})();

const calculateTimes = (t, graph, index = 0) => {
  const node = graph[index];
  if (node.t != null) return;
  if (node.in.length) {
    node.t = t + node.in[0].dt;
  } else {
    node.t = 0;
  }
  node.out.forEach(({ i }) => calculateTimes(node.t, graph, i));
};
