import { EventEmitter } from 'events';

/**
 * TaskEvents - Dedicated EventEmitter class for Task Management lifecycle events
 * Provides decoupled, non-blocking asynchronous event dispatching across the application.
 */
class TaskEvents extends EventEmitter {}

// Singleton event emitter instance
const taskEvents = new TaskEvents();

// Optional: increase max listeners if many background services hook in
taskEvents.setMaxListeners(20);

export default taskEvents;

