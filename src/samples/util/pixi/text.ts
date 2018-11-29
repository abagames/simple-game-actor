import { Actor } from "./actor";
import { dotPatterns, charToIndex } from "../letterPattern";

let textureCache: { [key: string]: PIXI.Texture } = {};

export interface Text extends Actor {
  setText: Function;
}

export function text(
  a: Text,
  str: string,
  {
    align = "center",
    style = "white",
    scale = 1
  }: {
    align?: "center" | "left" | "right";
    style?: string;
    scale?: number;
  } = {}
) {
  a.setText = (
    str: string,
    {
      align = "center",
      style = "white",
      scale = 1
    }: {
      align?: "center" | "left" | "right";
      style?: string;
      scale?: number;
    } = {}
  ) => {
    const texture = drawToTexture(str, { align, style, scale });
    a.setTextureToSprite(texture);
    if (a.sprite != null) {
      a.sprite.anchor.x = align === "left" ? 0 : align === "center" ? 0.5 : 1;
      a.sprite.anchor.y = 0;
    }
  };
  a.setText(str, { align, style, scale });
}

function drawToTexture(
  str: string,
  {
    align = "center",
    style = "white",
    scale = 1
  }: {
    align?: "center" | "left" | "right";
    style?: string;
    scale?: number;
  } = {}
) {
  const cacheKey = `${str}_${align}_${style}_${scale}`;
  const cachedTexture = textureCache[cacheKey];
  if (cachedTexture != null) {
    return cachedTexture;
  }
  const canvas = document.createElement("canvas");
  const lines = str.split("\n");
  let lx = 0;
  let ly = 0;
  let lw = 5 * scale;
  lines.forEach(l => {
    lx = Math.max(l.length * lw, lx);
    ly += 6 * scale;
  });
  canvas.width = Math.ceil(lx / 2) * 2;
  canvas.height = ly;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.clearRect(0, 0, lx, ly);
  ly = 0;
  lines.forEach(l => {
    drawLine(context, l, ly, align, style, scale, lx);
    ly += 6 * scale;
  });
  const texture = PIXI.Texture.fromCanvas(canvas);
  textureCache[cacheKey] = texture;
  return texture;
}

function drawLine(
  context: CanvasRenderingContext2D,
  str: string,
  y: number,
  align: "center" | "left" | "right",
  style: string,
  scale: number,
  width: number
) {
  let lw = 5 * scale;
  let lx = 0;
  if (align === "left") {
  } else if (align === "right") {
    lx = width - str.length * lw;
  } else {
    lx = width / 2 - (str.length * lw) / 2;
  }
  let ly = y;
  for (let i = 0; i < str.length; i++) {
    const idx = charToIndex[str.charCodeAt(i)];
    if (idx === -2) {
      throw `invalid char: ${str.charAt(i)}`;
    } else if (idx >= 0) {
      drawLetter(context, idx, lx, ly, style, scale);
    }
    lx += lw;
  }
  return lx;
}

function drawLetter(
  context: CanvasRenderingContext2D,
  idx: number,
  x: number,
  y: number,
  style: string,
  scale: number
) {
  const p = dotPatterns[idx];
  for (let i = 0; i < p.length; i++) {
    const d = p[i];
    context.fillStyle = style;
    context.fillRect(d.x * scale + x, d.y * scale + y, scale, scale);
  }
}
