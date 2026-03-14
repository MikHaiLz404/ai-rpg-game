import { EventEmitter } from 'events';

class EventBusClass extends EventEmitter {}

export const EventBus = new EventBusClass();
