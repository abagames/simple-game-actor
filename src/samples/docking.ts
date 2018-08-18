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
import * as math from "./util/math";

init({
  game: () => {
    const ta = spawn(text, "TElST");
    ta.pos.set(20, 30);
    spawn(ship);
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

async function ship(a: Actor) {
  a.pos.set(50, 20);
  const images = await pag.generateImagesPromise(
    `
  -
 --
---`,
    { isMirrorX: true }
  );
  a.setImage(images[0]);
  a.update(() => {
    a.vel.x += (pointer.pos.x - a.pos.x) * 0.0025;
    a.vel.y += (pointer.pos.y - a.pos.y) * 0.005;
    a.vel.mul(0.9);
    particle.emit("j_p", a.pos.x, a.pos.y, Math.PI / 2);
  });
}
