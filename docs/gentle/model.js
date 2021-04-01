import { proxy } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'

const edgeToString = edge => {
  return JSON.stringify(edge.transitions) + edge.word || "";
  return (
    JSON.stringify(
      (edge.transitions || []).map(({ phone }) => phone.split("_")[0])
    ) + (edge.word || "")
  );
  /*
  const edgeCopy = JSON.parse(JSON.stringify(edge));
  delete edgeCopy.from_state;
  return JSON.stringify(edgeCopy.transitions);
  */
};

export const model = (window.model = proxy());
(async () => {
  const lat = await (await fetch("lat.json")).json();
  const edges = [];
  lat.forEach(({ lattice }) => {
    for (const i in lattice) {
      for (const edge of lattice[i]) {
        edges.push(edgeToString(edge));
      }
    }
  });
  console.log(new Set(edges));
  /*
  edges.sort();
  let dup = 0;
  let prev;
  edges.forEach(edge => {
    if (edge !== prev) console.log(edge);
    if (edge === prev) ++dup;
    prev = edge;
  });
  */
  // console.log(edges.length, dup);
  /*
  model.nodesByTime = [];
  console.log(lat);
  lat.forEach(({ lattice }) => {
    // console.log(lattice)
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
    // console.log(graph);
    const nodesByTime = {};
    graph.forEach(node => {
      const t = node.t;
      nodesByTime[t] = nodesByTime[t] || [];
      nodesByTime[t].push(node);
    });
    model.nodesByTime.push(nodesByTime);
    console.log(nodesByTime);
  });
  */
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
