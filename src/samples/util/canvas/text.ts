import * as screen from "./screen";
import { dotPatterns, charToIndex } from "../letterPattern";

export function draw(
  str: string,
  x: number,
  y: number,
  {
    align = "center",
    style = "black",
    scale = 1
  }: {
    align?: "center" | "left" | "right";
    style?: string;
    scale?: number;
  } = {}
) {
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
