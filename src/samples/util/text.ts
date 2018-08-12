import * as screen from "./screen";

let dotPatterns;
let charToIndex;

export function init() {
  let p = 0;
  let d = 32;
  let pIndex = 0;
  dotPatterns = [];
  for (let i = 0; i < letterCount; i++) {
    let dots = [];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 4; x++) {
        if (++d >= 32) {
          p = letterPatterns[pIndex++];
          d = 0;
        }
        if ((p & 1) > 0) {
          dots.push({ x, y });
        }
        p >>= 1;
      }
    }
    dotPatterns.push(dots);
  }
  const charStr = "()[]<>=+-*/%&_!?,.:|'\"$@#\\urdl";
  charToIndex = [];
  for (let c = 0; c < 128; c++) {
    let li = -2;
    if (c == 32) {
      li = -1;
    } else if (c >= 48 && c < 58) {
      li = c - 48;
    } else if (c >= 65 && c < 90) {
      li = c - 65 + 10;
    } else {
      const ci = charStr.indexOf(String.fromCharCode(c));
      if (ci >= 0) {
        li = ci + 36;
      }
    }
    charToIndex.push(li);
  }
}

export function draw(
  str: string,
  x: number,
  y: number,
  options: {
    align?: "center" | "left" | "right";
    style?: string;
    scale?: number;
  } = {
    align: "center",
    style: "black",
    scale: 1
  }
) {
  const align = options.align || "center";
  const style = options.style || "black";
  const scale = options.scale || 1;
  const lines = str.split("\n");
  let ly = y;
  lines.forEach(l => {
    drawLine(l, x, ly, align, style, scale);
    ly += 6 * scale;
  });
}

export function drawLine(
  str: string,
  x: number,
  y: number,
  align: "center" | "left" | "right",
  style: string,
  scale: number
) {
  let lw = 5 * scale;
  let lx = x;
  if (align === "left") {
  } else if (align === "right") {
    lx -= str.length * lw;
  } else {
    lx -= (str.length * lw) / 2;
  }
  let ly = y;
  for (let i = 0; i < str.length; i++) {
    const idx = charToIndex[str.charCodeAt(i)];
    if (idx === -2) {
      throw `invalid char: ${str.charAt(i)}`;
    } else if (idx >= 0) {
      drawLetter(idx, lx, ly, style, scale);
    }
    lx += lw;
  }
}

function drawLetter(
  idx: number,
  x: number,
  y: number,
  style: string,
  scale: number
) {
  const p = dotPatterns[idx];
  for (let i = 0; i < p.length; i++) {
    const d = p[i];
    screen.fillRect(d.x * scale + x, d.y * scale + y, scale, scale, style);
  }
}

const letterCount = 66;
const letterPatterns = [
  0x4644aaa4,
  0x6f2496e4,
  0xf5646949,
  0x167871f4,
  0x2489f697,
  0xe9669696,
  0x79f99668,
  0x91967979,
  0x1f799976,
  0x1171ff17,
  0xf99ed196,
  0xee444e99,
  0x53592544,
  0xf9f11119,
  0x9ddb9999,
  0x79769996,
  0x7ed99611,
  0x861e9979,
  0x994444e7,
  0x46699699,
  0x6996fd99,
  0xf4469999,
  0x2224f248,
  0x26244424,
  0x64446622,
  0x84284248,
  0x40f0f024,
  0x0f0044e4,
  0x480a4e40,
  0x9a459124,
  0x000a5a16,
  0x640444f0,
  0x80004049,
  0x40400004,
  0x44444040,
  0x0aa00044,
  0x6476e400,
  0xfafa61d9,
  0xe44e4eaa,
  0x24f42445,
  0xf244e544,
  0x00000042
];
