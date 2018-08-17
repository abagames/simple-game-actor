export declare class Actor {
    pool: Pool;
    func: Function;
    isAlive: boolean;
    ticks: number;
    updaterPool: Pool;
    onRemove: Function;
    priority: number;
    remove(): void;
    update(updateFunc: (updater: Updater, actor: AnyActor) => void, interval?: number): any;
    setPool(pool: Pool): void;
    setPriority(priority: number): void;
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
    priority?: number;
}
export declare class Pool {
    instances: UpdatedInstance[];
    isRemovingAllInstances: boolean;
    isPriorityEnabled: boolean;
    add(instance: UpdatedInstance): void;
    updateFrame(): void;
    get(func?: Function): UpdatedInstance[];
    removeAll(): void;
    enablePriority(): void;
}
export declare const pool: Pool;
export declare const updaterPool: Pool;
export declare function spawn(initFunc: (actor: AnyActor, ...args: any[]) => void, ...args: any[]): AnyActor;
export declare function update(updateFunc: (updater: Updater, actor: AnyActor) => void, interval?: number): Updater;
export declare function updateFrame(): void;
export declare function reset(): void;
export declare function setActorClass(_actorClass: any): void;
