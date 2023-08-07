import { EventEmitter } from "events";

// export declare interface EventsBus {
//   on(event: "download", listener: (name: string) => void): this;
//   on(event: "upload", listener: (name: string) => void): this;
//   emit(event: string | symbol, ...args: any[]): boolean;
// }

// export class EventsBus extends EventEmitter {
//   private static instance: EventsBus;
//   constructor() {
//     super();
//   }
// }

export class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter();

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as []));
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.on(eventName, handler as any);
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.off(eventName, handler as any);
  }
}
