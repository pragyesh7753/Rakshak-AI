/**
 * System logs service
 * Handles processing log queries.
 */
import { apiRequest } from '@/lib/api/client';

/**
 * Fetch recent background-worker processing logs.
 * @param {number} limit
 */
export async function getProcessingLogs(limit = 20, getToken) {
  return apiRequest('/system/logs', {
    getToken,
    query: { limit },
  });
}

/**
 * Fetch aggregated processing-log summary metrics for system dashboard.
 * @param {number} hours
 */
export async function getProcessingLogSummary(hours = 24, getToken) {
  return apiRequest('/system/logs/summary', {
    getToken,
    query: { hours },
  });
}

/**
 * Trigger one backend pipeline cycle.
 */
export async function startPipelineRun(getToken) {
  try {
    return await apiRequest('/system/pipeline/start', {
      method: 'POST',
      getToken,
    });
  } catch (error) {
    const message = String(error?.message ?? 'Failed to start pipeline');
    if (message.toLowerCase().includes('already running')) {
      return {
        started: false,
        pipeline_running: true,
        message: 'Pipeline is already running',
      };
    }
    throw error;
  }
}
