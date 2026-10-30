import taskEvents from './events.js';
import { eventStore } from './eventStore.js';

/**
 * Register all event listeners for the Task Management background processing subsystem.
 * This file is imported once at application startup (server.js).
 */
export const registerEventListeners = () => {
  console.log('📡 [Event Subsystem] Initializing Task Management Event Listeners...');

  // ==========================================
  // 1. Task Created Listener (Core Requirement)
  // ==========================================
  taskEvents.on('task-created', (payload) => {
    // Normalization to handle both raw task objects and wrapped metadata payloads
    const task = payload?.task || payload;
    const user = payload?.user || null;
    const apiResponseTimestamp = payload?.apiResponseTimestamp || new Date().toISOString();
    const assignedUser = user ? (user.name || user.email || user._id) : (task.user || 'System / Unassigned');
    const delayMs = payload?.customDelay !== undefined ? payload.customDelay : eventStore.getDelayMs();

    const listenerStartIso = new Date().toISOString();
    console.log(`\n📥 [Notification Listener] Received 'task-created' event at ${listenerStartIso}`);
    console.log(`   Task Title : "${task.title}"`);
    console.log(`   Assigned To: ${assignedUser}`);
    console.log(`   Priority   : ${task.priority || 'medium'}`);
    console.log(`   API Sent At: ${apiResponseTimestamp}`);
    console.log(`   Status     : Processing background email & audit log asynchronously (${delayMs}ms delay)...`);

    // Record initial pending log in telemetry store
    const logItem = eventStore.addLog({
      event: 'task-created',
      taskId: task._id || task.id,
      taskTitle: task.title,
      assignedUser: String(assignedUser),
      apiResponseTimestamp,
      listenerStartTimestamp: listenerStartIso,
      simulatedDelayMs: delayMs,
      status: 'PROCESSING',
      message: `Asynchronous notification dispatched for "${task.title}". Simulating background delivery (${delayMs}ms)...`
    });

    // Supplementary: Check if error simulation is requested
    const shouldFail = eventStore.getSimulateError() || (task.title && task.title.includes('[simulate-error]'));

    // Artificial delay to simulate real-world background I/O (e.g. SMTP email, Slack webhook, analytics indexing)
    setTimeout(() => {
      try {
        if (shouldFail) {
          throw new Error(`Simulated Notification Delivery Failure for task: "${task.title}" (SMTP gateway timeout simulation)`);
        }

        const listenerFinishIso = new Date().toISOString();
        const finishMsg = `[Notification] Task "${task.title}" created at ${listenerFinishIso} (User: ${assignedUser})`;
        console.log(`\n✅ ${finishMsg}`);
        console.log(`   ⏱️ [Timing Verification] API Response Sent: ${apiResponseTimestamp}`);
        console.log(`   ⏱️ [Timing Verification] Listener Finished: ${listenerFinishIso}`);
        console.log(`   ⚡ [Proof of Non-Blocking]: The HTTP client received HTTP 201 before this log was emitted!\n`);

        eventStore.updateLog(logItem.id, {
          status: 'COMPLETED',
          listenerFinishTimestamp: listenerFinishIso,
          durationMs: delayMs,
          message: finishMsg
        });
      } catch (err) {
        // Emit error event to be handled by the registered error listener (Supplementary Problem 2)
        taskEvents.emit('error', err, { logId: logItem.id, task });
      }
    }, delayMs);
  });

  // ==========================================
  // 2. Task Deleted Listener (Supplementary 1)
  // ==========================================
  taskEvents.on('task-deleted', (payload) => {
    const task = payload?.task || payload;
    const user = payload?.user || null;
    const apiResponseTimestamp = payload?.apiResponseTimestamp || new Date().toISOString();
    const assignedUser = user ? (user.name || user.email || user._id) : (task.user || 'System / Unassigned');
    const deleteTimestamp = new Date().toISOString();

    const deleteMessage = `[Notification] Task "${task.title || task._id}" DELETED at ${deleteTimestamp} (Audit logged for ${assignedUser})`;
    console.log(`\n🗑️ ${deleteMessage}`);
    console.log(`   ⏱️ [Timing Verification] API Response Sent: ${apiResponseTimestamp}`);
    console.log(`   ⏱️ [Timing Verification] Deletion Cleanup: ${deleteTimestamp}\n`);

    eventStore.addLog({
      event: 'task-deleted',
      taskId: task._id || task.id,
      taskTitle: task.title || 'Untitled Task',
      assignedUser: String(assignedUser),
      apiResponseTimestamp,
      listenerStartTimestamp: deleteTimestamp,
      listenerFinishTimestamp: deleteTimestamp,
      simulatedDelayMs: 0,
      status: 'COMPLETED',
      message: deleteMessage
    });
  });

  // ==========================================
  // 3. Error Event Listener (Supplementary 2)
  // ==========================================
  // In Node.js EventEmitter, an unhandled 'error' event crashes the process.
  // Registering an error listener guarantees robust crash prevention.
  taskEvents.on('error', (err, context) => {
    const errorTimestamp = new Date().toISOString();
    console.error(`\n🚨 [Event Error Listener] Safely caught asynchronous event error at ${errorTimestamp}:`);
    console.error(`   Message: ${err.message}`);
    if (context?.task) {
      console.error(`   Affected Task: "${context.task.title}" (ID: ${context.task._id || context.task.id})`);
    }
    console.error(`   🛡️ [Server Safety]: Node.js server remains alive and completely stable!\n`);

    if (context?.logId) {
      eventStore.updateLog(context.logId, {
        status: 'ERROR',
        error: err.message,
        listenerFinishTimestamp: errorTimestamp,
        message: `Error handled safely: ${err.message}`
      });
    } else {
      eventStore.addLog({
        event: 'error',
        taskId: context?.task?._id || 'N/A',
        taskTitle: context?.task?.title || 'Unknown',
        assignedUser: 'System',
        apiResponseTimestamp: errorTimestamp,
        listenerStartTimestamp: errorTimestamp,
        listenerFinishTimestamp: errorTimestamp,
        simulatedDelayMs: 0,
        status: 'ERROR',
        error: err.message,
        message: `Caught unhandled event exception safely: ${err.message}`
      });
    }
  });

  console.log('✅ [Event Subsystem] Registered listeners for: [task-created, task-deleted, error]');
};

