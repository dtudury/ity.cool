import { render, h } from "./horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'
import { model, sortedPhonemes } from "./model.js";
const scale = 15;
const height = 13;
const phonemeToColor = phoneme => {
  let shortPhone = phoneme.split("_")[0].toLowerCase();
  shortPhone = shortPhone
    .split("")
    .filter(c => !c.match(/\d/))
    .join("");
  const index = sortedPhonemes.indexOf(shortPhone);
  if (index != -1) {
    const h = Math.floor((360 * index) / sortedPhonemes.length);
    return `hsl(${h}, 80%, 70%)`;
  } else {
    return `hsl(0, 0%, 90%)`;
  }
};
const lines = el => {
  const titleoutput = [];
  const graphoutput = [];
  const rectoutput = [];
  const textoutput = [];
  const fileNames = Object.keys(model.files);
  const sectionHeight = model.innerHeight / fileNames.length;
  let offsetT = model.offsetT;
  if (model.isPlaying) {
    offsetT = model.currentTime * 100;
  }
  const scrollY = model.scrollY;
  let isMoving = model.isMoving || model.isPlaying;
  fileNames.forEach((fileName, index) => {
    const y = index * sectionHeight;
    const { maxDt, edgesByTime } = model.files[fileName];
    const tWidth = model.innerWidth / scale;
    const toPoint = (i, t) => {
      const _offsetT = t - offsetT;
      const x = _offsetT * scale;
      const y = -scrollY + height * 2 * (1 + i) + sectionHeight * index;
      return { x, y };
    };
    for (const t in edgesByTime) {
      if (t < offsetT + tWidth && t > offsetT - maxDt) {
        const groups = edgesByTime[t];
        for (const groupString in groups) {
          const group = groups[groupString];
          const { transitions, word, dt } = JSON.parse(groupString);
          const p = toPoint(group.i, t);
          if (p.y > y && p.y < y + sectionHeight) {
            const onmouseover = el => e => {
              e.stopImmediatePropagation();
              model.selectedGroup = group;
              model.selectedIndex = index;
            };
            const onmousedown = el => e => {
              e.stopImmediatePropagation();
              if (model.isPlaying) {
                model.audio.pause();
                model.isPlaying = false;
              } else {
                model.audio.currentTime = t / 100;
                model.audio.play();
                model.isPlaying = true;
              }
            };
            const y2 = p.y + height;
            const width = dt * scale;
            rectoutput.push(h`
              <rect 
                onmouseover=${onmouseover}
                onmousedown=${onmousedown}
                x="${p.x}" 
                y="${p.y}" 
                width="${width}" 
                height="${height}" 
                fill="white" 
                stroke="hsl(0, 0%, 90%)"
              />
            `);
            textoutput.push(h`
              <text 
                x="${p.x + width / 2}" 
                y="${p.y + height / 2}" 
                dominant-baseline="central"
                text-anchor="middle"
                style="pointer-events: none;"
              >${word}</text>
            `);
            if (!isMoving && !model.selectedGroup) {
              let phoneX = 0;
              for (const { phone, length } of transitions) {
                const shortPhone = phone.split("_")[0];
                const color = phonemeToColor(phone);
                const width = length * scale;
                rectoutput.push(h`
                  <rect 
                    x="${p.x + phoneX}" 
                    y="${y2}" 
                    width="${width}" 
                    height="${height}" 
                    fill="${color}" 
                    stroke="hsl(0, 0%, 90%)"
                    style="pointer-events: none;"
                  />
                `);
                textoutput.push(h`
                  <text 
                    fill="rgba(255, 255, 255, 50%)"
                    x="${p.x + phoneX + width / 2}" 
                    y="${y2 + height / 2}" 
                    dominant-baseline="central"
                    text-anchor="middle"
                    style="pointer-events: none;"
                  >${shortPhone}</text>
                `);
                phoneX += width;
              }
            }
          }
        }
      }
    }
    if (model.selectedGroup && model.selectedIndex === index) {
      const drawEdge = (leftEdge, rightEdge) => {
        const offsetI = 0.25;
        const p0 = toPoint(
          offsetI + leftEdge.i,
          leftEdge.t + leftEdge.dt * 0.75
        );
        const p1 = toPoint(offsetI + leftEdge.i, leftEdge.t + leftEdge.dt);
        const p2 = toPoint(offsetI + rightEdge.i, rightEdge.t);
        const p3 = toPoint(
          offsetI + rightEdge.i,
          rightEdge.t + rightEdge.dt * 0.25
        );
        const space = p => `${p.x} ${p.y}`;
        graphoutput.push(h`
          <path 
            d="
              M ${space(p0)}
              C ${space(p1)}
                ${space(p2)}
                ${space(p3)}
            "
            stroke="hsla(0, 100%, 70%, 50%)"
            fill="none"
            style="pointer-events: none;"
          />
        `);
      };
      for (const edge of model.selectedGroup.edges) {
        for (const incomingEdge of edge.to) {
          drawEdge(incomingEdge, model.selectedGroup);
        }
        for (const outgoingEdge of edge.from) {
          drawEdge(model.selectedGroup, outgoingEdge);
        }
      }
    }
    titleoutput.push(h`
      <rect 
        x="0" 
        y="${y}" 
        width="${model.innerWidth}" 
        height="${height * 2}" 
        fill="hsl(0, 0%, 80%)" 
        stroke="hsl(0, 0%, 70%)"
        style="pointer-events: none;"
      />
      <text 
        x="10" 
        y="${y + height}" 
        dominant-baseline="central"
        text-anchor="left"
        fill="hsl(0, 0%, 100%)"
        style="pointer-events: none;"
      >${fileName}</text>
    `);
  });
  return [rectoutput, graphoutput, textoutput, titleoutput];
};

let movingTimeout;
window.onscroll = () => {
  clearTimeout(movingTimeout);
  model.offsetT = window.scrollX / scale;
  model.scrollY = window.scrollY;
  model.isMoving = true;
  movingTimeout = setTimeout(() => (model.isMoving = false), 100);
  model.audio.pause();
  model.isPlaying = false;
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
      background: oldlace;
    }
    svg {
      position: fixed;
      height: 100vh;
      width: 100vw;
      display: block;
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

document.body.onmouseover = () => {
  model.selectedGroup = null;
  model.selectedIndex = null;
  model.isMoving = true;
  movingTimeout = setTimeout(() => (model.isMoving = false), 300);
};
document.body.onmousedown = () => {
  model.audio.pause();
  model.isPlaying = false;
};

setInterval(() => {
  if (model.audio) {
    model.currentTime = model.audio.currentTime;
  }
});
