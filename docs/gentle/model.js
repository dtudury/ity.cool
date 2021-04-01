import { proxy } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'

export const model = (window.model = proxy({ offsetT: 0 }));

const phonemes = new Set();
const edgeToString = edge => {
  edge.transitions.forEach(({ phone }) => phonemes.add(phone.split("_")[0]));
  return JSON.stringify({
    transitions: edge.transitions,
    word: edge.word,
    dt: edge.dt
  });
};

(async () => {
  const lat = await (await fetch("lat.json")).json();
  let maxT = 0;
  let maxDt = 0;
  const edges = [];
  const edgesByTime = {};
  let latticeIndex = 0;
  lat.forEach(({ lattice }) => {
    const duration = edge =>
      (edge.transitions || []).reduce((a, { length }) => a + length, 0);
    const edgesByFrom = {};
    // const edgesByTo = {};
    for (const i in lattice) {
      for (const edge of lattice[i]) {
        const edgeIndex = edges.length;
        edge.latticeIndex = latticeIndex;
        edge.dt = duration(edge);
        maxDt = Math.max(maxDt, edge.dt);
        edges.push(edge);
        const toState = edge.to_state;
        const fromState = edge.from_state;
        if (toState != null && fromState != null) {
          edgesByFrom[fromState] = edgesByFrom[fromState] || [];
          edgesByFrom[fromState].push({ toState, edgeIndex });
          // edgesByTo[toState] = edgesByTo[toState] || [];
          // edgesByTo[toState].push({ fromState, edgeIndex });
        }
      }
    }
    const calculateTimes = (state, t) => {
      (edgesByFrom[state] || []).forEach(({ toState, edgeIndex }) => {
        edgesByTime[t] = edgesByTime[t] || {};
        const edgeString = edgeToString(edges[edgeIndex]);
        const group = (edgesByTime[t][edgeString] =
          edgesByTime[t][edgeString] || []);
        const dt = edges[edgeIndex].dt;
        maxT = Math.max(maxT, t + dt);
        if (!group.includes(edgeIndex)) {
          group.push(edgeIndex);
          calculateTimes(toState, t + dt);
        }
      });
    };
    calculateTimes(0, maxT);
    ++latticeIndex;
  });
  console.log(edgesByTime);
  model.edges = edges;
  model.edgesByTime = edgesByTime;
  model.maxT = maxT;
  model.maxDt = maxDt;
  // console.log([...phonemes].sort());
})();

export const sortedPhonemes = [
  "aa",
  "ae",
  "ah",
  "ao",
  "aw",
  "ay",
  "eh",
  "er",
  "ey",
  "ih",
  "iy",
  "ow",
  "oy",
  "uh",
  "uw",

  "m",
  "n",
  "ng",

  "ch",
  "dh",
  "jh",
  "sh",
  "th",
  "zh",

  "b",
  "d",
  "g",
  "k",
  "p",
  "t",

  "f",
  "hh",
  "s",
  "v",
  "w",
  "z",

  "l",
  "r",
  "y"

  /*
  "noise",
  "oov",
  "sil"
  */
];
