export const size = 100;
export const pixelRatio = 2;

export let canvas: HTMLCanvasElement;
export let context: CanvasRenderingContext2D;

export function init() {
  canvas = document.createElement("canvas");
  canvas.width = canvas.height = size * pixelRatio;
  context = canvas.getContext("2d");
  document.body.appendChild(canvas);
}

export const background = "#ddd";

export function clear() {
  fillRect(0, 0, size, size, background);
}

export function fillRect(
  x: number,
  y: number,
  width: number,
  height: number,
  style = "black"
) {
  context.fillStyle = style;
  context.fillRect(
    Math.floor(x * pixelRatio),
    Math.floor(y * pixelRatio),
    Math.floor(width * pixelRatio),
    Math.floor(height * pixelRatio)
  );
}
