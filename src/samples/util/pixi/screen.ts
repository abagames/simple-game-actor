import * as PIXI from "pixi.js";
import * as PIXIFilters from "pixi-filters";
import * as pag from "pixel-art-gen";
import * as ppe from "particle-pattern-emitter";
import * as particle from "./particle";

export let app: PIXI.Application;
export let container: PIXI.Container;
export let size: number;
export let padding: number;
export let canvas: HTMLCanvasElement;

export function init(
  onBeforeParticleContainer: Function,
  _size = 100,
  _padding = 10,
  backgroundColor = 0x111111,
  edgeColor = 0
) {
  size = _size;
  padding = _padding;
  const appSize = size + padding * 2;
  app = new PIXI.Application({ width: appSize, height: appSize });
  canvas = app.view;
  document.body.style["background"] = "black";
  /*pag.setDefaultOptions({
    isLimitingColors: true,
    colorNoise: 0,
    colorLighting: 0.2
  });
  ppe.setOptions({
    isLimitingColors: true
  });*/
  app.view.setAttribute("id", "screen");
  document.body.appendChild(app.view);
  const filterContainer = new PIXI.Container();
  filterContainer.filterArea = new PIXI.Rectangle(0, 0, appSize, appSize);
  app.stage.addChild(filterContainer);
  const bloomFilter = new PIXIFilters.AdvancedBloomFilter({
    threshold: 0.1,
    bloomScale: 1,
    brightness: 0.5,
    blur: 5
  });
  filterContainer.filters = [bloomFilter];
  const backgroundContainer = new PIXI.Container();
  const background = new PIXI.Graphics();
  background.beginFill(backgroundColor);
  background.drawRect(padding, padding, size, size);
  background.endFill();
  backgroundContainer.addChild(background);
  filterContainer.addChild(backgroundContainer);
  if (onBeforeParticleContainer != null) {
    onBeforeParticleContainer(filterContainer);
  }
  particle.init(app, filterContainer, padding);
  container = new PIXI.Container();
  container.x = container.y = padding;
  filterContainer.addChild(container);
  //text.init(filterContainer, padding);
  const edgeContainer = new PIXI.Container();
  const edge = new PIXI.Graphics();
  edge.beginFill(edgeColor);
  edge.drawRect(0, 0, padding, appSize);
  edge.drawRect(appSize - padding, 0, padding, appSize);
  edge.drawRect(0, 0, appSize, padding);
  edge.drawRect(0, appSize - padding, appSize, padding);
  edge.endFill();
  edgeContainer.addChild(edge);
  filterContainer.addChild(edgeContainer);
}

export function clear() {}
