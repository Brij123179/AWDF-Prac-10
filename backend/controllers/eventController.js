import { eventStore } from '../events/eventStore.js';
import taskEvents from '../events/events.js';

export const eventController = {
  /**
   * GET /api/events/logs
   * Retrieves background event telemetry logs and current configuration.
   */
  getLogs: (req, res) => {
    const logs = eventStore.getLogs();
    res.status(200).json({
      success: true,
      count: logs.length,
      config: {
        simulatedDelayMs: eventStore.getDelayMs(),
        shouldSimulateError: eventStore.getSimulateError()
      },
      data: logs
    });
  },

  /**
   * DELETE /api/events/logs
   * Clears all in-memory telemetry logs.
   */
  clearLogs: (req, res) => {
    eventStore.clearLogs();
    res.status(200).json({
      success: true,
      message: 'Event logs cleared successfully'
    });
  },

  /**
   * POST /api/events/config
   * Updates background simulated delay and error simulation flag.
   */
  updateConfig: (req, res) => {
    const { delayMs, shouldSimulateError } = req.body;

    if (delayMs !== undefined) {
      eventStore.setDelayMs(delayMs);
    }
    if (shouldSimulateError !== undefined) {
      eventStore.setSimulateError(shouldSimulateError);
    }

    res.status(200).json({
      success: true,
      message: 'Event configuration updated',
      config: {
        simulatedDelayMs: eventStore.getDelayMs(),
        shouldSimulateError: eventStore.getSimulateError()
      }
    });
  },

  /**
   * POST /api/events/trigger-error
   * Deliberately dispatches an error to verify Supplementary Problem 2 error listener.
   */
  triggerError: (req, res) => {
    const errorMsg = req.body.message || 'Deliberately triggered asynchronous test error';
    const err = new Error(errorMsg);

    // Respond to HTTP request first
    res.status(200).json({
      success: true,
      message: 'Asynchronous error event emitted to test error listener resilience.',
      errorEmitted: errorMsg,
      timestamp: new Date().toISOString()
    });

    // Asynchronously emit error event
    setTimeout(() => {
      taskEvents.emit('error', err, {
        task: { title: 'Test Synthetic Error Event', id: 'manual-test' }
      });
    }, 50);
  }
};

