import { proxy } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'

export const model = (window.model = proxy({ offsetT: 0, scrollY: 0, yOverflow: 0 }));

const phonemes = new Set();
const edgeToString = edge => {
  edge.transitions.forEach(({ phone }) => phonemes.add(phone.split("_")[0]));
  return JSON.stringify({
    transitions: edge.transitions,
    word: edge.word,
    dt: edge.dt
  });
};

const buildFromHash = async () => {
  let parsedHash;
  try {
    const hash = location.hash.substr(1);
    if (hash) {
      parsedHash = JSON.parse(unescape(hash));
    }
  } catch (e) {
    console.error(e);
  }
  if (
    !parsedHash ||
    !parsedHash.length ||
    !parsedHash.every(element => typeof element === "string")
  ) {
    parsedHash = ["./demo/gentle-lattice.json", "./demo/kaldi-lattice.json"];
  }
  model.files = {};
  for (const jsonUrl of parsedHash) {
    const lattice = await (await fetch(jsonUrl)).json();
    let maxT = 0;
    let maxDt = 0;
    const edges = [];
    const edgesByTime = {};
    const duration = edge =>
      (edge.transitions || []).reduce((a, { length }) => a + length, 0);
    const edgesByFrom = {};
    for (const i in lattice) {
      for (const edge of lattice[i]) {
        const edgeIndex = edges.length;
        edge.dt = duration(edge);
        maxDt = Math.max(maxDt, edge.dt);
        edges.push(edge);
        const toState = edge.to_state;
        const fromState = edge.from_state;
        if (toState != null && fromState != null) {
          edgesByFrom[fromState] = edgesByFrom[fromState] || [];
          edgesByFrom[fromState].push({ toState, edgeIndex });
        }
      }
    }
    const calculateTimes = (state, t) => {
      (edgesByFrom[state] || []).forEach(({ toState, edgeIndex }) => {
        edgesByTime[t] = edgesByTime[t] || {};
        const str = edgeToString(edges[edgeIndex]);
        const dt = edges[edgeIndex].dt;
        const group = (edgesByTime[t][str] = edgesByTime[t][str] || {
          edges: [],
          dt
        });
        maxT = Math.max(maxT, t + dt);
        if (!group.edges.includes(edgeIndex)) {
          group.edges.push(edgeIndex);
          calculateTimes(toState, t + dt);
        }
      });
    };
    calculateTimes(0, maxT);
    const positions = [];
    for (const time in edgesByTime) {
      const getNextIndex = () => {
        let i = 0;
        while (positions[i] > time) ++i;
        return i;
      };
      for (const str in edgesByTime[time]) {
        const group = edgesByTime[time][str];
        const i = getNextIndex();
        group.i = i;
        positions[i] = +time + group.dt;
      }
    }
    model.files[jsonUrl] = { edges, edgesByTime, maxT, maxDt, maxStack: positions.length };
  }
  // console.log([...phonemes].sort());
};

buildFromHash();
window.onhashchange = buildFromHash;

export const sortedPhonemes = [
  "l",
  "r",
  "y",

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

  /*
  "noise",
  "oov",
  "sil"
  */
];
