import * as sga from "../..";
import * as sss from "sounds-some-sounds";
import * as gcc from "gif-capture-canvas";
import * as letterPattern from "./letterPattern";
import * as pointer from "./pointer";
import * as keyboard from "./keyboard";
import Vector from "./vector";
import Random from "./random";

export const random = new Random();
export let ticks = 0;
export let difficulty = 1;
export let isUsingKeyboard = false;

const difficultyDoubledSecond = 30;
const enableKeyboard = false;
let beginGameFunc: Function;
let beginGameOverFunc: Function;
let beginTitleFunc: Function;
let scene: "title" | "game" | "gameOver";
let _screen;

const isCapturing = false;

export function init({
  title,
  game,
  gameOver,
  init,
  screen,
  actorClass,
  isDebugMode = false
}: {
  title?: Function;
  game?: Function;
  gameOver?: Function;
  init?: Function;
  screen: any;
  actorClass?: any;
  isDebugMode?: boolean;
}) {
  beginTitleFunc = title;
  beginGameFunc = game;
  beginGameOverFunc = gameOver;
  sss.init();
  _screen = screen;
  screen.init();
  letterPattern.init();
  pointer.init(
    screen.canvas,
    new Vector(screen.size),
    new Vector(),
    sss.playEmpty,
    sss.resumeAudioContext,
    isDebugMode
  );
  if (enableKeyboard) {
    keyboard.init();
  }
  if (actorClass != null) {
    sga.setActorClass(actorClass);
  }
  if (isCapturing) {
    gcc.setOptions({ scale: 1 });
  }
  window.addEventListener("load", () => {
    if (init != null) {
      init();
    }
    if (beginTitleFunc != null) {
      beginTitle();
    } else {
      if (isDebugMode) {
        beginGame();
      } else {
        endGame();
      }
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
  if (enableKeyboard) {
    keyboard.update();
  }
  _screen.clear();
  sga.updateFrame();
  updateScene();
  ticks++;
  if (isCapturing) {
    gcc.capture(_screen.canvas);
  }
}

function updateScene() {
  if (
    (scene === "title" || (scene === "gameOver" && ticks > 40)) &&
    (pointer.isPressed || (enableKeyboard && keyboard.isPressed))
  ) {
    isUsingKeyboard = enableKeyboard && keyboard.isPressed;
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
