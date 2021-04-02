import { render, h, mapEntries } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'
import { model, sortedPhonemes } from "./model.js";
const scale = 15;
const height = 13;
const phonemeToColor = phoneme => {
  const index = sortedPhonemes.indexOf(phoneme);
  if (index != -1) {
    const h = Math.floor((360 * index) / sortedPhonemes.length);
    return `hsl(${h}, 80%, 70%)`;
  } else {
    return `hsl(0, 0%, 90%)`;
  }
};
const lines = el => {
  const output = [];
  const fileNames = Object.keys(model.files);
  const sectionHeight = model.innerHeight / fileNames.length;
  const offsetT = model.offsetT;
  const scrollY = model.scrollY;
  let isMoving = model.isMoving;
  fileNames.forEach((fileName, index) => {
    const y = index * sectionHeight;
    const { maxDt, edgesByTime } = model.files[fileName];
    const tWidth = model.innerWidth / scale;
    for (const t in edgesByTime) {
      if (t < offsetT + tWidth && t > offsetT - maxDt) {
        const _offsetT = t - offsetT;
        const groups = edgesByTime[t];
        for (const groupString in groups) {
          const group = groups[groupString];
          const { transitions, word, dt } = JSON.parse(groupString);
          const x = _offsetT * scale;
          const y1 =
            -scrollY + height * 2 * (1 + group.i) + sectionHeight * index;
          if (y1 > y && y1 < y + sectionHeight) {
            const y2 = y1 + height;
            const width = dt * scale;
            output.push(h`
              <rect x="${x}" y="${y1}" width="${width}" height="${height}" fill="white" stroke="rgb(155, 155, 155)"/>
              <text 
                x="${x + width / 2}" 
                y="${y1 + height / 2}" 
                dominant-baseline="central"
                text-anchor="middle"
              >${word}</text>
            `);
            if (!isMoving) {
              let phoneX = 0;
              for (const { phone, length } of transitions) {
                const shortPhone = phone.split("_")[0];
                const color = phonemeToColor(shortPhone);
                const width = length * scale;
                output.push(h`
                  <rect 
                    x="${x + phoneX}" 
                    y="${y2}" 
                    width="${width}" 
                    height="${height}" 
                    fill="${color}" 
                    stroke="rgb(155, 155, 155)"
                  />
                  <text 
                    fill="rgba(255, 255, 255, 50%)"
                    x="${x + phoneX + width / 2}" 
                    y="${y2 + height / 2}" 
                    dominant-baseline="central"
                    text-anchor="middle"
                  >${shortPhone}</text>
                `);
                phoneX += width;
              }
            }
          }
        }
      }
    }
    output.push(h`
      <rect x="0" y="${y}" width="${model.innerWidth}" height="${
      height * 2
    }" fill="hsl(0, 0%, 80%)" stroke="rgb(155, 155, 155)"/>
      <text 
        x="10" 
        y="${y + height}" 
        dominant-baseline="central"
        text-anchor="left"
        fill="hsl(0, 0%, 100%)"
      >${fileName}</text>
    `);
  });
  return output;
};

let movingTimeout;
window.onscroll = () => {
  clearTimeout(movingTimeout);
  model.offsetT = window.scrollX / scale;
  model.scrollY = window.scrollY;
  model.isMoving = true;
  movingTimeout = setTimeout(() => (model.isMoving = false), 100);
};
window.onresize = () => {
  model.innerWidth = window.innerWidth;
  model.innerHeight = window.innerHeight;
};
window.onresize();

const maxT = () => {
  return (
    scale *
    Object.values(model.files).reduce((acc, { maxT }) => Math.max(acc, maxT), 0)
  );
};

const maxH = () => {
  const fileCount = Object.keys(model.files).length;
  const sectionHeight = model.innerHeight / fileCount;
  const maxmax =
    2 +
    Object.values(model.files).reduce(
      (acc, { maxStack }) => Math.max(acc, maxStack),
      0
    );
  return Math.max(0, maxmax * 2 * height - sectionHeight);
};

const styleElement = document.createElement("style");
document.head.appendChild(styleElement);
render(
  styleElement,
  h`
    body {
      margin: 0;
      width: ${maxT}px;
      height: calc(100vh + ${maxH}px);
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
