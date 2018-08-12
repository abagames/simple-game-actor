export class Actor {
  pool = pool;
  name;
  isAlive = true;
  ticks = 0;
  updaterPool = new Pool();
  onRemove: Function;

  init(initFunc: (actor: AnyActor, ...args) => void, ...args) {
    this.name = initFunc.name;
    initFunc(this, ...args);
    this.pool.add(this);
  }

  setPool(pool: Pool) {
    this.pool = pool;
  }

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

  updateFrame() {
    this.updaterPool.updateFrame();
    this.ticks++;
  }
}

export interface AnyActor extends Actor {
  [key: string]: any;
}

export class Updater {
  name = "updater";
  isAlive = true;
  ticks = 0;

  constructor(
    public updateFunc: (updater: Updater, actor: AnyActor) => void,
    public interval: number,
    public actor: AnyActor
  ) {}

  updateFrame() {
    if (this.ticks % this.interval === 0) {
      this.updateFunc(this, this.actor);
    }
    this.ticks++;
  }

  remove() {
    this.isAlive = false;
  }
}

export interface UpdatedInstance {
  name: string;
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

  get(name: string = null) {
    return name == null
      ? this.instances
      : this.instances.filter(a => a.name === name);
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

export function reset() {
  pool.removeAll();
  updaterPool.removeAll();
}

let actorClass = Actor;

export function setActorClass(_actorClass) {
  actorClass = _actorClass;
}

export function updateFrame() {
  pool.updateFrame();
  updaterPool.updateFrame();
}
