import { spawn, update } from "..";
import { Actor, Rect } from "./util/actor";
import { init } from "./util/game";
import * as pointer from "./util/pointer";
import Vector from "./util/vector";
import math from "./util/math";

function player(a: Actor & { isOnWall: boolean }) {
  a.setRect(5, 5);
  a.addRect(new Rect(3, 3, "black", 0, -5));
  a.addRect(new Rect(3, 3, "black", -4, -6, 0.2));
  a.addRect(new Rect(3, 3, "black", 4, -6, 0.2));
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
  a.setRect(70, 5);
  a.pos.set(x, y);
}

init();
spawn(wall, 50, 90);
spawn(wall, 70, 50);
spawn(player);
