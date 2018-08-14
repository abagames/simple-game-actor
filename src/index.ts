export class Actor {
  pool = pool;
  func: Function;
  isAlive = true;
  ticks = 0;
  updaterPool = new Pool();
  onRemove: Function;

  remove() {
    if (!this.isAlive) {
      return;
    }
    if (this.onRemove != null) {
      this.onRemove();
    }
    this.isAlive = false;
  }

  update(
    updateFunc: (updater: Updater, actor: AnyActor) => void,
    interval = 1
  ) {
    this.updaterPool.add(new Updater(updateFunc, interval, this));
  }

  setPool(pool: Pool) {
    this.pool = pool;
  }

  init(initFunc: (actor: AnyActor, ...args) => void, ...args) {
    this.func = initFunc;
    initFunc(this, ...args);
    this.pool.add(this);
  }

  updateFrame() {
    this.updaterPool.updateFrame();
    this.ticks++;
  }
}

export interface AnyActor extends Actor {
  [key: string]: any;
}

export class Updater {
  func: Function;
  isAlive = true;
  ticks = 0;
  intervalTicks = 0;

  remove() {
    this.isAlive = false;
  }

  setInterval(interval: number) {
    this.interval = interval;
  }

  constructor(
    public updateFunc: (updater: Updater, actor: AnyActor) => void,
    public interval: number,
    public actor: AnyActor
  ) {
    this.func = updateFunc;
  }

  updateFrame() {
    this.intervalTicks--;
    if (this.intervalTicks <= 0) {
      this.updateFunc(this, this.actor);
      this.intervalTicks = this.interval;
    }
    this.ticks++;
  }
}

export interface UpdatedInstance {
  func: Function;
  isAlive: boolean;
  updateFrame: Function;
  remove: Function;
}

export class Pool {
  instances: UpdatedInstance[] = [];
  isRemovingAllInstances = false;

  add(instance: UpdatedInstance) {
    this.instances.push(instance);
  }

  updateFrame() {
    for (let i = 0; i < this.instances.length; ) {
      const instance = this.instances[i];
      if (instance.isAlive) {
        instance.updateFrame();
      }
      if (this.isRemovingAllInstances) {
        this.isRemovingAllInstances = false;
        break;
      }
      if (instance.isAlive) {
        i++;
      } else {
        this.instances.splice(i, 1);
      }
    }
  }

  get(func?: Function) {
    return func == null
      ? this.instances
      : this.instances.filter(a => a.func === func);
  }

  removeAll() {
    this.instances.forEach(a => {
      a.remove();
    });
    this.instances = [];
    this.isRemovingAllInstances = true;
  }
}

export const pool = new Pool();
export const updaterPool = new Pool();
let actorClass = Actor;

export function spawn(initFunc: (actor: AnyActor, ...args) => void, ...args) {
  const actor: AnyActor = new actorClass();
  actor.init(initFunc, ...args);
  pool.add(actor);
}

export function update(
  updateFunc: (updater: Updater, actor: AnyActor) => void,
  interval = 1
) {
  updaterPool.add(new Updater(updateFunc, interval, null));
}

export function updateFrame() {
  pool.updateFrame();
  updaterPool.updateFrame();
}

export function reset() {
  pool.removeAll();
  updaterPool.removeAll();
}

export function setActorClass(_actorClass) {
  actorClass = _actorClass;
}
