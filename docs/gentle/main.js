import { render, h, mapEntries } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'
import { model } from "./model.js";
const scale = 10;

const lines = el => {
  const output = [];
  const fileNames = Object.keys(model.files);
  fileNames.forEach((fileName, index) => {
    const offsetT = model.offsetT;
    const { maxDt, edgesByTime } = model.files[fileName];
    const tWidth = window.innerWidth / scale;
    for (const t in edgesByTime) {
      if (t < offsetT + tWidth && t > offsetT - maxDt) {
        const _offsetT = t - offsetT;
        const groups = edgesByTime[t];
        let i = 0;
        for (const groupString in groups) {
          const { transitions, word, dt } = JSON.parse(groupString);
          const x = _offsetT * scale;
          const y = 17 * i + (window.innerHeight * index) / fileNames.length;
          const width = dt * scale;
          const height = 15;
          output.push(h`
            <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="white"/>
            <text 
              x="${x + width / 2}" 
              y="${y + height / 2}" 
              dominant-baseline="middle"
              text-anchor="middle"
            >${word}</text>
          `);
          ++i;
        }
      }
    }
  });
  return output;
};

const maxT = () => {
  document.onscroll = () => (model.offsetT = window.scrollX / scale);
  console.log(Object.values(model.files).map(({ maxT }) => maxT));
  return scale *Object.values(model.files).reduce(
    (acc, { maxT }) => Math.max(acc, maxT),
    0
  );
};

const styleElement = document.createElement("style");
document.head.appendChild(styleElement);
render(
  styleElement,
  h`
    body {
      margin: 0;
      width: ${maxT}px;
      height: calc(100vh + ${() => model.yOverflow}px);
      overflow: scroll;
    }
    svg {
      position: fixed;
      height: 100vh;
      width: 100vw;
      display: block;
      background: oldlace;
    }
  `
);

render(
  document.body,
  h`
    <svg xmlns="http://www.w3.org/2000/svg">
      ${lines}
    </svg>
    without some text it won't scroll
  `
);
