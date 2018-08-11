import { spawn, update } from "..";
import { Actor } from "./util/actor";
import { init } from "./util/game";
import * as pointer from "./util/pointer";
import Vector from "./util/vector";
import math from "./util/math";

function player(a: Actor & { isOnWall: boolean }) {
  a.pos.set(50, 20);
  a.isOnWall = false;
  const sb = new Vector(0, -1);
  a.update(() => {
    a.pos.x = math.clamp(pointer.pos.x, 0, 99);
    a.vel.y += 0.1;
    if (a.vel.y > 0 && a.getColliding("wall")) {
      a.stepBack("wall", sb);
      a.vel.y = 0;
      a.isOnWall = true;
    }
    if (a.isOnWall) {
      if (pointer.isJustPressed) {
        a.vel.y = -3;
      }
      if (a.vel.length > 1) {
        a.isOnWall = false;
      }
    }
  });
}

function wall(a: Actor, x, y) {
  a.size.set(70, 5);
  a.pos.set(x, y);
}

init();
spawn(wall, 50, 90);
spawn(wall, 70, 50);
spawn(player);
