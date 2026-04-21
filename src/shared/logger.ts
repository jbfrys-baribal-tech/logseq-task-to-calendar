import { PLUGIN_NAME } from "./constants";

/**
 * Logs an informational message using a plugin-specific prefix.
 */
export function logInfo(message: string, context?: unknown): void {
  if (context === undefined) {
    console.info(`[${PLUGIN_NAME}] ${message}`);
    return;
  }

  console.info(`[${PLUGIN_NAME}] ${message}`, context);
}

/**
 * Logs an error message using a plugin-specific prefix.
 */
export function logError(message: string, error?: unknown): void {
  if (error === undefined) {
    console.error(`[${PLUGIN_NAME}] ${message}`);
    return;
  }

  console.error(`[${PLUGIN_NAME}] ${message}`, error);
}
