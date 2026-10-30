/**
 * In-Memory Event Telemetry Store
 * Keeps track of emitted events, timestamps, and execution lifecycles
 * for educational demonstration and live dashboard inspection.
 */

let simulatedDelayMs = parseInt(process.env.EVENT_SIMULATED_DELAY_MS || '2000', 10);
let shouldSimulateError = false;
const eventLogs = [];
const MAX_LOGS = 100;

export const eventStore = {
  getDelayMs: () => simulatedDelayMs,
  setDelayMs: (ms) => {
    simulatedDelayMs = Math.max(0, parseInt(ms, 10) || 0);
    return simulatedDelayMs;
  },
  getSimulateError: () => shouldSimulateError,
  setSimulateError: (flag) => {
    shouldSimulateError = Boolean(flag);
    return shouldSimulateError;
  },
  addLog: (logEntry) => {
    const entry = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...logEntry
    };
    eventLogs.unshift(entry);
    if (eventLogs.length > MAX_LOGS) {
      eventLogs.pop();
    }
    return entry;
  },
  updateLog: (id, updates) => {
    const item = eventLogs.find(e => e.id === id);
    if (item) {
      Object.assign(item, updates);
    }
    return item;
  },
  getLogs: () => [...eventLogs],
  clearLogs: () => {
    eventLogs.length = 0;
    return true;
  }
};

