import { spawn } from "..";
import { Actor } from "./util/actor";
import { init } from "./util/index";

function player(a: Actor) {
  a.pos.set(10, 20);
  a.update(() => {
    a.pos.x += 0.1;
  });
  a.update(() => {
    a.pos.y += 0.1;
  }, 5);
}

init();
spawn(player);
