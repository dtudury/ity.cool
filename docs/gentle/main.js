import { render, h, mapEntries } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'
import { model } from "./model.js";
const scale = 10;

const lines = el => {
  if (model.edgesByTime) {
    const output = [];
    const tWidth = window.innerWidth / scale;
    const innerHeight = window.innerHeight;
    for (const t in model.edgesByTime) {
      if (t < model.offsetT + tWidth && t > model.offsetT - model.maxDt) {
        const offsetT = t - model.offsetT;
        const groups = model.edgesByTime[t];
        let i = 0;
        const stackHeight = Object.keys(groups).length;
        for (const groupString in groups) {
          const { transitions, word, dt } = JSON.parse(groupString);
          const x = offsetT * scale;
          const y = innerHeight * i / stackHeight
          const width = dt * scale;
          const height = 20;
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
    return output;
  }
};

document.onscroll = () => {
  model.offsetT = window.scrollX / scale;
};

const styleElement = document.createElement("style");
document.head.appendChild(styleElement);
render(
  styleElement,
  h`
    body {
      margin: 0;
      width: ${() => model.maxT * scale}px;
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
