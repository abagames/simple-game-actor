export declare class Actor {
    pool: Pool;
    func: Function;
    isAlive: boolean;
    ticks: number;
    updaterPool: Pool;
    onRemove: Function;
    remove(): void;
    update(updateFunc: (updater: Updater, actor: AnyActor) => void, interval?: number): void;
    setPool(pool: Pool): void;
    init(initFunc: (actor: AnyActor, ...args: any[]) => void, ...args: any[]): void;
    updateFrame(): void;
}
export interface AnyActor extends Actor {
    [key: string]: any;
}
export declare class Updater {
    updateFunc: (updater: Updater, actor: AnyActor) => void;
    interval: number;
    actor: AnyActor;
    func: Function;
    isAlive: boolean;
    ticks: number;
    intervalTicks: number;
    remove(): void;
    setInterval(interval: number): void;
    constructor(updateFunc: (updater: Updater, actor: AnyActor) => void, interval: number, actor: AnyActor);
    updateFrame(): void;
}
export interface UpdatedInstance {
    func: Function;
    isAlive: boolean;
    updateFrame: Function;
    remove: Function;
}
export declare class Pool {
    instances: UpdatedInstance[];
    isRemovingAllInstances: boolean;
    add(instance: UpdatedInstance): void;
    updateFrame(): void;
    get(func?: Function): UpdatedInstance[];
    removeAll(): void;
}
export declare const pool: Pool;
export declare const updaterPool: Pool;
export declare function spawn(initFunc: (actor: AnyActor, ...args: any[]) => void, ...args: any[]): void;
export declare function update(updateFunc: (updater: Updater, actor: AnyActor) => void, interval?: number): void;
export declare function updateFrame(): void;
export declare function reset(): void;
export declare function setActorClass(_actorClass: any): void;
