import { spawn, update } from "..";
import { Actor, Rect } from "./util/actor";
import { init, random, difficulty } from "./util/game";
import * as pointer from "./util/pointer";
import Vector from "./util/vector";
import math from "./util/math";

function player(a: Actor & { wallOn: boolean | Actor }) {
  a.setRect(5, 5);
  a.addRect(new Rect(3, 3, { offset: { y: -5 } }));
  a.addRect(new Rect(3, 3, { offset: { x: -4, y: -6 }, springRatio: 0.2 }));
  a.addRect(new Rect(3, 3, { offset: { x: 4, y: -6 }, springRatio: 0.2 }));
  a.pos.set(50, 20);
  a.wallOn = false;
  const sb = new Vector(0, -1);
  a.update(() => {
    a.pos.x = math.clamp(pointer.pos.x, 0, 99);
    a.vel.y += 0.1;
    if (a.wallOn) {
      if (pointer.isJustPressed) {
        a.vel.y = -3;
      } else {
        a.pos.y += 1;
        if (a.stepBack(a.wallOn as Actor, sb)) {
          a.vel.y = 0;
        }
        if (a.vel.length > 1) {
          a.wallOn = false;
        }
      }
    } else {
      if (a.pos.y < 0 && a.vel.y < 0) {
        a.vel.y *= -0.5;
      }
      a.wallOn = a.getColliding("wall");
      if (a.vel.y > 0 && a.wallOn) {
        a.stepBack(a.wallOn as Actor, sb);
        a.vel.y = 0;
      }
    }
  });
}

function wall(a: Actor, x, y, vx, vy, width) {
  a.setRect(width, 5);
  a.pos.set(x, y);
  a.vel.set(vx, vy);
}

init();
spawn(wall, 50, 80, 0, 0.1, 99);
spawn(player);
update(() => {
  spawn(
    wall,
    random.get(99),
    -5,
    0,
    random.get(0.1, 1) * difficulty,
    random.get(20, 70)
  );
}, 20);
