import * as sss from "sounds-some-sounds";
import { spawn, update, reset } from "..";
import { Actor, Rect } from "./util/canvas/actor";
import {
  init,
  endGame,
  random,
  ticks,
  difficulty,
  isUsingKeyboard
} from "./util/game";
import * as screen from "./util/pixi/screen";
import * as particle from "./util/pixi/particle";
//import * as text from "./util/pixi/text";
import * as pointer from "./util/pointer";
import * as keyboard from "./util/keyboard";
import Vector from "./util/vector";
import * as math from "./util/math";

init({
  game: () => {
    update(() => {
      if (ticks % 30 === 0) {
        particle.emit("e1", pointer.pos.x, pointer.pos.y);
      }
    });
  },
  init: () => {
    update(() => {
      particle.updateFrame();
    });
  },
  screen: screen,
  actorClass: Actor,
  isDebugMode: true
});
