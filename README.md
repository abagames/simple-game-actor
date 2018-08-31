# simple-game-actor

Simple actor and actor pool for game objects.

[code](https://github.com/abagames/simple-game-actor/blob/master/src/index.ts)

## Demo

[BOARD SURF](https://abagames.github.io/simple-game-actor/index.html?surf)
([code](https://github.com/abagames/simple-game-actor/blob/master/src/samples/surf.ts))

[![surf screenshot](https://abagames.github.io/simple-game-actor/surf.gif)](https://abagames.github.io/simple-game-actor/index.html?surf)

[DOCKING](https://abagames.github.io/simple-game-actor/index.html?docking)
([code](https://github.com/abagames/simple-game-actor/blob/master/src/samples/docking.ts))

[![docking screenshot](https://abagames.github.io/simple-game-actor/docking.gif)](https://abagames.github.io/simple-game-actor/index.html?docking)

## How to use

Create your own Actor class by extending sga(simple-game-actor).Actor class, ([actor.ts](https://github.com/abagames/simple-game-actor/blob/master/src/samples/util/canvas/actor.ts))

```typescript
export class Actor extends sga.Actor {
  pos = new Vector();
  prevPos = new Vector();
  vel = new Vector();
  speed = 0;
  angle = 0;
  rects: Rect[] = [];
...
```

and set it with the `sga.setActorClass` function.

```typescript
sga.setActorClass(Actor);
```

Define the function to initialize the actor, ([surf.ts](https://github.com/abagames/simple-game-actor/blob/master/src/samples/surf.ts))

```typescript
function wall(a: Actor & { score: number }, x, y, vx, vy, width) {
  a.setRect(width, 8);
  a.pos.set(x, y);
  a.vel.set(vx, vy);
  const vxs = Math.abs(vx) + 1;
  const vys = Math.abs(vy) + 1;
  a.score = Math.floor((vxs * vxs * vys * vys * 50) / width + 1) * 10;
```

and add the updater to update the actor every frame.

```typescript
  a.addUpdater(u => {
    if (a.score == null) {
      u.remove();
      return;
    }
    screen.fillRect(a.pos.x - 8, a.pos.y - 3, 16, 5, screen.background);
    text.draw(`${a.score}`, a.pos.x, a.pos.y - 3);
  });
}
```

Call the `spawn` function with the initializing function and arguments for spawning the actor.

```typescript
spawn(wall, 50, 80, 0, 0.1, 99);
```

The `sga.update` function should be called from the requestAnimationFrame loop for handling spawned actors. ([game.ts](https://github.com/abagames/simple-game-actor/blob/master/src/samples/util/game.ts))

```typescript
function update() {
  requestAnimationFrame(update);
...
  sga.update();
...
```
