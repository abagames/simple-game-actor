export declare class Actor {
    pool: Pool;
    func: Function;
    isAlive: boolean;
    ticks: number;
    updaterPool: Pool;
    onRemove: Function;
    priority: number;
    remove(): void;
    addUpdater(updateFunc: (updater: Updater, actor: AnyActor) => void, interval?: number): any;
    setPool(pool: Pool): void;
    setPriority(priority: number): void;
    init(initFunc: (actor: AnyActor, ...args: any[]) => void, ...args: any[]): void;
    update(): void;
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
    update(): void;
}
export interface UpdatedInstance {
    func: Function;
    isAlive: boolean;
    update: Function;
    remove: Function;
    priority?: number;
}
export declare class Pool {
    instances: UpdatedInstance[];
    isRemovingAllInstances: boolean;
    isPriorityEnabled: boolean;
    add(instance: UpdatedInstance): void;
    update(): void;
    get(func?: Function): UpdatedInstance[];
    removeAll(): void;
    enablePriority(): void;
}
export declare const pool: Pool;
export declare const updaterPool: Pool;
export declare function spawn(initFunc: (actor: AnyActor, ...args: any[]) => void, ...args: any[]): AnyActor;
export declare function addUpdater(updateFunc: (updater: Updater, actor: AnyActor) => void, interval?: number): Updater;
export declare function update(): void;
export declare function reset(): void;
export declare function setActorClass(_actorClass: any): void;
