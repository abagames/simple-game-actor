import * as sss from "sounds-some-sounds";
import * as pag from "pixel-art-gen";
import { spawn, update, reset } from "..";
import { Actor } from "./util/pixi/actor";
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
import { text } from "./util/pixi/text";
import * as pointer from "./util/pointer";
import * as keyboard from "./util/keyboard";
import Vector from "./util/vector";
import { range } from "./util/math";

init({
  game: () => {
    spawn(ship, 0, true);
    spawn(ship, 1);
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

async function ship(a: Actor, size = 0, isPlayer = false) {
  if (isPlayer) {
    a.pos.set(50, 20);
  } else {
    a.pos.set(50, 90);
  }
  const shipStr = range(3 + (size % 2)).map(
    i =>
      `${range(size + 2 - i)
        .map(() => " ")
        .join("")}${range(i + 1 + (size + (size % 2)) * 2)
        .map(() => "-")
        .join("")}`
  );
  const images = await pag.generateImagesPromise(shipStr, {
    isMirrorX: true,
    scale: Math.floor(size * 0.5) + 1
  });
  a.setImage(images[0]);
  if (isPlayer) {
    a.addUpdater(() => {
      a.vel.x += (pointer.pos.x - a.pos.x) * 0.0025;
      a.vel.y += (pointer.pos.y - a.pos.y) * 0.005;
      a.vel.mul(0.9);
      particle.emit("j_p", a.pos.x, a.pos.y, Math.PI / 2);
    });
  }
}
