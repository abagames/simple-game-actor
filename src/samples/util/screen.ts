export const size = 99;

export let canvas: HTMLCanvasElement;
export let context: CanvasRenderingContext2D;

export function init() {
  canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  context = canvas.getContext("2d");
  document.body.appendChild(canvas);
}

const background = "#ddd";

export function clear() {
  context.fillStyle = background;
  context.fillRect(0, 0, size, size);
}
