/**
 * ExceptionManager.ts - Centralized Exception and Logging Management
 * Provides consistent error handling, logging, and debugging across the application
 */

import { randomUUID } from 'crypto';
import * as fs from 'fs-extra';
import * as path from 'path';

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL',
}

export interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    data?: any;
    stack?: string;
    duration?: number; // milliseconds
}

class ExceptionManager {
    private logFile: string = path.join(process.cwd(), '.logs', `app-${new Date().toISOString().split('T')[0]}.log`);
    private logBuffer: LogEntry[] = [];
    private maxBufferSize: number = 100;
    private readonly isDevelopment: boolean = process.env.NODE_ENV === 'development';

    constructor() {
        this.ensureLogDirectory();
    }

    /**
     * Ensure log directory exists
     */
    private ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        try {
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
        } catch (e) {
            console.error('[ExceptionManager] Failed to create log directory:', e);
        }
    }

    /**
     * Format log message
     */
    private formatLogMessage(entry: LogEntry): string {
        const { timestamp, level, context, message, duration } = entry;
        const durationStr = duration ? ` [${duration}ms]` : '';
        return `[${timestamp}] [${level}] [${context}]${durationStr} ${message}`;
    }

    /**
     * Write log entry to buffer and file
     */
    private writeLog(entry: LogEntry) {
        // Add to buffer
        this.logBuffer.push(entry);

        // Console output
        this.consoleLog(entry);

        // Flush if buffer is full
        if (this.logBuffer.length >= this.maxBufferSize) {
            this.flushLogs();
        }
    }

    /**
     * Console output with color coding
     */
    private consoleLog(entry: LogEntry) {
        const formatted = this.formatLogMessage(entry);
        const colors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m', // Green
            [LogLevel.WARN]: '\x1b[33m', // Yellow
            [LogLevel.ERROR]: '\x1b[31m', // Red
            [LogLevel.CRITICAL]: '\x1b[35m', // Magenta
        };
        const reset = '\x1b[0m';
        const color = colors[entry.level] || reset;

        console.log(`${color}${formatted}${reset}`);

        if (entry.data && this.isDevelopment) {
            console.log(`  Data:`, entry.data);
        }

        if (entry.stack && entry.level === LogLevel.ERROR) {
            console.log(`  Stack:`, entry.stack);
        }
    }

    /**
     * Flush logs to file
     */
    private flushLogs() {
        if (this.logBuffer.length === 0) return;

        try {
            const lines = this.logBuffer.map(entry => {
                const line = this.formatLogMessage(entry);
                return entry.data ? `${line}\n  Data: ${JSON.stringify(entry.data)}` : line;
            });

            fs.appendFileSync(this.logFile, lines.join('\n') + '\n', 'utf-8');
            this.logBuffer = [];
        } catch (e) {
            console.error('[ExceptionManager] Failed to flush logs:', e);
        }
    }

    /**
     * Log at DEBUG level
     */
    debug(context: string, message: string, data?: any) {
        this.writeLog({
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            level: LogLevel.DEBUG,
            context,
            message,
            data,
        });
    }

    /**
     * Log at INFO level
     */
    info(context: string, message: string, data?: any) {
        this.writeLog({
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            context,
            message,
            data,
        });
    }

    /**
     * Log at WARN level
     */
    warn(context: string, message: string, data?: any) {
        this.writeLog({
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            level: LogLevel.WARN,
            context,
            message,
            data,
        });
    }

    /**
     * Log at ERROR level
     */
    error(context: string, message: string, error?: Error | any, data?: any) {
        const entry: LogEntry = {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            level: LogLevel.ERROR,
            context,
            message,
            data,
        };

        if (error instanceof Error) {
            entry.stack = error.stack;
            entry.data = { ...entry.data, errorMessage: error.message };
        } else if (error) {
            entry.data = { ...entry.data, error };
        }

        this.writeLog(entry);
    }

    /**
     * Log at CRITICAL level with alert
     */
    critical(context: string, message: string, error?: Error | any, data?: any) {
        const entry: LogEntry = {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            level: LogLevel.CRITICAL,
            context,
            message,
            data,
        };

        if (error instanceof Error) {
            entry.stack = error.stack;
            entry.data = { ...entry.data, errorMessage: error.message };
        } else if (error) {
            entry.data = { ...entry.data, error };
        }

        this.writeLog(entry);

        // Alert for critical errors (could integrate with monitoring service)
        this.sendAlert(entry);
    }

    /**
     * Handle exception with automatic logging
     */
    handleException(context: string, error: Error | any, metadata?: any): string {
        const exceptionId = randomUUID();

        if (error instanceof Error) {
            this.error(context, `Exception: ${error.message}`, error, { exceptionId, ...metadata });
        } else {
            this.error(context, `Exception: ${String(error)}`, undefined, { exceptionId, error, ...metadata });
        }

        return exceptionId;
    }

    /**
     * Track operation timing
     */
    timeOperation<T>(context: string, operationName: string, fn: () => T): T {
        const start = Date.now();
        try {
            const result = fn();
            const duration = Date.now() - start;
            this.debug(context, `Operation '${operationName}' completed`, { duration });
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            this.error(context, `Operation '${operationName}' failed`, error, { duration });
            throw error;
        }
    }

    /**
     * Track async operation timing
     */
    async timeAsyncOperation<T>(context: string, operationName: string, fn: () => Promise<T>): Promise<T> {
        const start = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - start;
            this.debug(context, `Async operation '${operationName}' completed`, { duration });
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            this.error(context, `Async operation '${operationName}' failed`, error, { duration });
            throw error;
        }
    }

    /**
     * Send alert for critical errors (placeholder for integration)
     */
    private sendAlert(entry: LogEntry) {
        // Could integrate with:
        // - Sentry
        // - DataDog
        // - Slack
        // - Email service
        // For now, just log to console
        console.error(`\n🚨 CRITICAL ALERT: [${entry.context}] ${entry.message}\n`);
    }

    /**
     * Force flush all pending logs
     */
    flush() {
        this.flushLogs();
    }

    /**
     * Get recent logs
     */
    getRecentLogs(count: number = 50): LogEntry[] {
        try {
            const content = fs.readFileSync(this.logFile, 'utf-8');
            // Simple parsing - in production use structured logging
            return this.logBuffer.slice(-count);
        } catch (e) {
            this.warn('ExceptionManager', 'Failed to read log file', { error: String(e) });
            return this.logBuffer.slice(-count);
        }
    }

    /**
     * Clear old logs (keep last N days)
     */
    clearOldLogs(retentionDays: number = 7) {
        try {
            const logsDir = path.dirname(this.logFile);
            const files = fs.readdirSync(logsDir);
            const now = Date.now();
            const threshold = retentionDays * 24 * 60 * 60 * 1000;

            files.forEach(file => {
                const filePath = path.join(logsDir, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtime.getTime() > threshold) {
                    fs.removeSync(filePath);
                    this.info('ExceptionManager', `Deleted old log file: ${file}`);
                }
            });
        } catch (e) {
            this.warn('ExceptionManager', 'Failed to clear old logs', { error: String(e) });
        }
    }
}

// Create singleton instance
const exceptionManager = new ExceptionManager();

// Graceful shutdown handler
process.on('exit', () => {
    exceptionManager.flush();
});

process.on('SIGINT', () => {
    exceptionManager.flush();
    process.exit(0);
});

process.on('SIGTERM', () => {
    exceptionManager.flush();
    process.exit(0);
});

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
    exceptionManager.critical('Process', 'Uncaught Exception', error);
    exceptionManager.flush();
    process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    exceptionManager.critical('Process', 'Unhandled Promise Rejection', new Error(String(reason)), { promise });
    exceptionManager.flush();
});

export default exceptionManager;
