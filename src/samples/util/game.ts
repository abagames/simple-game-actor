import * as sga from "../..";
import * as sss from "sounds-some-sounds";
import * as gcc from "gif-capture-canvas";
import * as screen from "./screen";
import * as text from "./text";
import * as pointer from "./pointer";
import { Actor } from "./actor";
import Vector from "./vector";
import Random from "./random";

export const random = new Random();
export let ticks = 0;
export let difficulty = 1;

const difficultyDoubledSecond = 30;
let beginGameFunc: Function;
let beginGameOverFunc: Function;
let beginTitleFunc: Function;
let scene: "title" | "game" | "gameOver";

const isCapturing = false;

export function init(
  _beginGameFunc: Function,
  _beginGameOverFunc?: Function,
  _beginTitleFunc?: Function,
  _initFunc?: Function
) {
  beginGameFunc = _beginGameFunc;
  beginGameOverFunc = _beginGameOverFunc;
  beginTitleFunc = _beginTitleFunc;
  sss.init();
  screen.init();
  text.init();
  pointer.init(
    screen.canvas,
    new Vector(screen.size),
    new Vector(),
    sss.playEmpty,
    sss.resumeAudioContext
  );
  sga.setActorClass(Actor);
  if (isCapturing) {
    gcc.setOptions({ scale: 1 });
  }
  window.addEventListener("load", () => {
    if (_initFunc != null) {
      _initFunc();
    }
    if (_beginTitleFunc != null) {
      beginTitle();
    } else {
      endGame();
    }
    update();
  });
}

export function endGame() {
  if (beginGameOverFunc != null) {
    beginGameOverFunc();
  }
  scene = "gameOver";
  ticks = 0;
}

function update() {
  requestAnimationFrame(update);
  sss.update();
  pointer.update();
  screen.clear();
  sga.updateFrame();
  updateScene();
  ticks++;
  if (isCapturing) {
    gcc.capture(screen.canvas);
  }
}

function updateScene() {
  if (
    (scene === "title" || (scene === "gameOver" && ticks > 40)) &&
    pointer.isPressed
  ) {
    beginGame();
  }
  if (scene === "gameOver" && ticks > 180) {
    beginTitle();
  }
  difficulty = scene === "game" ? 1 + ticks / 60 / difficultyDoubledSecond : 1;
}

function beginTitle() {
  if (beginTitleFunc == null) {
    return;
  }
  scene = "title";
  ticks = 0;
  beginTitleFunc();
}

function beginGame() {
  scene = "game";
  ticks = 0;
  beginGameFunc();
}
