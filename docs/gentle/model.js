import { proxy } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'

export const model = (window.model = proxy());
(async () => {
  const lat = await (await fetch("lat.json")).json();
  lat.forEach(({ lattice }) => {
    const graph = [];
    console.log(lattice);
    for (const i in lattice) {
      const edges = lattice[i];
      for (const edge of edges) {
        const { from_state, to_state } = edge;
        if (from_state == null || to_state == null) break;
        if (!graph[from_state]) {
          graph[from_state] = { in: [], out: [] };
        }
        if (!graph[to_state]) {
          graph[to_state] = { in: [], out: [] };
        }
        graph[from_state].out.push({ i: to_state, edge });
        graph[to_state].in.push({ i: from_state, edge });
      }
    }
    console.log(graph[0]);
    calculateTimes(0, graph);
    console.log(graph);
    /*
    const memo = [];
    buildEdges(lattice, 0, memo);
    memo.sort((a, b) => a.t - b.t);
    console.log(memo);
    let openEdges = [];
    memo.forEach(node => {
      let index;
      const removedIndices = node.in.map(removal => openEdges.indexOf(removal))
      if(Math.max(...removedIndices) - Math.min(...removedIndices) !== removedIndices.length - 1) {
        // console.log(removedIndices)
      }
      node.in.forEach(removal => {
        index = openEdges.indexOf(removal);
        openEdges.splice(index, 1);
      });
      index = index || 0;
      node.out.forEach(addition => {
        openEdges.splice(index, 0, addition);
      });
      // console.log(openEdges.map(edge => edge.word), node.t);
    });
    */
  });
})();

const calculateTimes = (t, graph, index = 0) => {
  const node = graph[index];
  if (node.t != null) return;
  if (node.in.length) {
    const p = node.in[0];
    const dt = p.edge.transitions.reduce((a, { length }) => a + length, 0);
    node.t = t + dt;
  } else {
    node.t = 0;
  }
  node.out.forEach(({ i }) => calculateTimes(node.t, graph, i));
};

const buildEdges = (lattice, index = 0, memo = []) => {
  for (const edge of lattice[index]) {
    connectEdge(lattice, edge, memo);
  }
};

const connectEdge = (
  lattice,
  { from_state, to_state, acoustic_cost, graph_cost, word, transitions },
  memo
) => {
  if (from_state == null || to_state == null) {
    return;
  }
  const dt = transitions.reduce((a, { length }) => a + length, 0);
  if (!memo[from_state]) {
    memo[from_state] = { in: [], out: [], t: 0 };
  }
  const prev = memo[from_state];
  if (!memo[to_state]) {
    memo[to_state] = { in: [], out: [], t: prev.t + dt };
    buildEdges(lattice, to_state, memo);
  }
  const edge = {
    next: memo[to_state],
    prev: memo[from_state],
    acoustic_cost,
    graph_cost,
    word,
    transitions,
    dt
  };
  memo[from_state].out.push(edge);
  memo[to_state].in.push(edge);
};

const buildGraph = (
  lattice,
  memo = [],
  index = 0,
  t = 0,
  dt = 0,
  data = null
) => {
  if (!memo[index]) {
    const node = (memo[index] = { out: [], in: [], t, dt, data, index });
    lattice[index].forEach(data => {
      const _dt = (data.transitions || []).reduce(
        (acc, { length }) => acc + length,
        0
      );
      const to_state = data.to_state;
      if (to_state != null) {
        const nextNode = buildGraph(lattice, memo, to_state, t + dt, _dt, data);
        if (node.out.indexOf(nextNode) === -1) {
          node.out.push(nextNode);
        }
        if (nextNode.in.indexOf(node) === -1) {
          nextNode.in.push(node);
        }
      }
    });
  }
  return memo[index];
};

const findTail = node => {
  if (node.out.length) return findTail(node.out[0]);
  return node;
};
