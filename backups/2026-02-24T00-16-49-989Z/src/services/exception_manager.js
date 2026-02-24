"use strict";
/**
 * ExceptionManager.ts - Centralized Exception and Logging Management
 * Provides consistent error handling, logging, and debugging across the application
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
var crypto_1 = require("crypto");
var fs = require("fs-extra");
var path = require("path");
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["CRITICAL"] = "CRITICAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var ExceptionManager = /** @class */ (function () {
    function ExceptionManager() {
        this.logFile = path.join(process.cwd(), '.logs', "app-".concat(new Date().toISOString().split('T')[0], ".log"));
        this.logBuffer = [];
        this.maxBufferSize = 100;
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.ensureLogDirectory();
    }
    /**
     * Ensure log directory exists
     */
    ExceptionManager.prototype.ensureLogDirectory = function () {
        var logDir = path.dirname(this.logFile);
        try {
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
        }
        catch (e) {
            console.error('[ExceptionManager] Failed to create log directory:', e);
        }
    };
    /**
     * Format log message
     */
    ExceptionManager.prototype.formatLogMessage = function (entry) {
        var timestamp = entry.timestamp, level = entry.level, context = entry.context, message = entry.message, duration = entry.duration;
        var durationStr = duration ? " [".concat(duration, "ms]") : '';
        return "[".concat(timestamp, "] [").concat(level, "] [").concat(context, "]").concat(durationStr, " ").concat(message);
    };
    /**
     * Write log entry to buffer and file
     */
    ExceptionManager.prototype.writeLog = function (entry) {
        // Add to buffer
        this.logBuffer.push(entry);
        // Console output
        this.consoleLog(entry);
        // Flush if buffer is full
        if (this.logBuffer.length >= this.maxBufferSize) {
            this.flushLogs();
        }
    };
    /**
     * Console output with color coding
     */
    ExceptionManager.prototype.consoleLog = function (entry) {
        var _a;
        var formatted = this.formatLogMessage(entry);
        var colors = (_a = {},
            _a[LogLevel.DEBUG] = '\x1b[36m',
            _a[LogLevel.INFO] = '\x1b[32m',
            _a[LogLevel.WARN] = '\x1b[33m',
            _a[LogLevel.ERROR] = '\x1b[31m',
            _a[LogLevel.CRITICAL] = '\x1b[35m',
            _a);
        var reset = '\x1b[0m';
        var color = colors[entry.level] || reset;
        console.log("".concat(color).concat(formatted).concat(reset));
        if (entry.data && this.isDevelopment) {
            console.log("  Data:", entry.data);
        }
        if (entry.stack && entry.level === LogLevel.ERROR) {
            console.log("  Stack:", entry.stack);
        }
    };
    /**
     * Flush logs to file
     */
    ExceptionManager.prototype.flushLogs = function () {
        var _this = this;
        if (this.logBuffer.length === 0)
            return;
        try {
            var lines = this.logBuffer.map(function (entry) {
                var line = _this.formatLogMessage(entry);
                return entry.data ? "".concat(line, "\n  Data: ").concat(JSON.stringify(entry.data)) : line;
            });
            fs.appendFileSync(this.logFile, lines.join('\n') + '\n', 'utf-8');
            this.logBuffer = [];
        }
        catch (e) {
            console.error('[ExceptionManager] Failed to flush logs:', e);
        }
    };
    /**
     * Log at DEBUG level
     */
    ExceptionManager.prototype.debug = function (context, message, data) {
        this.writeLog({
            id: (0, crypto_1.randomUUID)(),
            timestamp: new Date().toISOString(),
            level: LogLevel.DEBUG,
            context: context,
            message: message,
            data: data,
        });
    };
    /**
     * Log at INFO level
     */
    ExceptionManager.prototype.info = function (context, message, data) {
        this.writeLog({
            id: (0, crypto_1.randomUUID)(),
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            context: context,
            message: message,
            data: data,
        });
    };
    /**
     * Log at WARN level
     */
    ExceptionManager.prototype.warn = function (context, message, data) {
        this.writeLog({
            id: (0, crypto_1.randomUUID)(),
            timestamp: new Date().toISOString(),
            level: LogLevel.WARN,
            context: context,
            message: message,
            data: data,
        });
    };
    /**
     * Log at ERROR level
     */
    ExceptionManager.prototype.error = function (context, message, error, data) {
        var entry = {
            id: (0, crypto_1.randomUUID)(),
            timestamp: new Date().toISOString(),
            level: LogLevel.ERROR,
            context: context,
            message: message,
            data: data,
        };
        if (error instanceof Error) {
            entry.stack = error.stack;
            entry.data = __assign(__assign({}, entry.data), { errorMessage: error.message });
        }
        else if (error) {
            entry.data = __assign(__assign({}, entry.data), { error: error });
        }
        this.writeLog(entry);
    };
    /**
     * Log at CRITICAL level with alert
     */
    ExceptionManager.prototype.critical = function (context, message, error, data) {
        var entry = {
            id: (0, crypto_1.randomUUID)(),
            timestamp: new Date().toISOString(),
            level: LogLevel.CRITICAL,
            context: context,
            message: message,
            data: data,
        };
        if (error instanceof Error) {
            entry.stack = error.stack;
            entry.data = __assign(__assign({}, entry.data), { errorMessage: error.message });
        }
        else if (error) {
            entry.data = __assign(__assign({}, entry.data), { error: error });
        }
        this.writeLog(entry);
        // Alert for critical errors (could integrate with monitoring service)
        this.sendAlert(entry);
    };
    /**
     * Handle exception with automatic logging
     */
    ExceptionManager.prototype.handleException = function (context, error, metadata) {
        var exceptionId = (0, crypto_1.randomUUID)();
        if (error instanceof Error) {
            this.error(context, "Exception: ".concat(error.message), error, __assign({ exceptionId: exceptionId }, metadata));
        }
        else {
            this.error(context, "Exception: ".concat(String(error)), undefined, __assign({ exceptionId: exceptionId, error: error }, metadata));
        }
        return exceptionId;
    };
    /**
     * Track operation timing
     */
    ExceptionManager.prototype.timeOperation = function (context, operationName, fn) {
        var start = Date.now();
        try {
            var result = fn();
            var duration = Date.now() - start;
            this.debug(context, "Operation '".concat(operationName, "' completed"), { duration: duration });
            return result;
        }
        catch (error) {
            var duration = Date.now() - start;
            this.error(context, "Operation '".concat(operationName, "' failed"), error, { duration: duration });
            throw error;
        }
    };
    /**
     * Track async operation timing
     */
    ExceptionManager.prototype.timeAsyncOperation = function (context, operationName, fn) {
        return __awaiter(this, void 0, void 0, function () {
            var start, result, duration, error_1, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fn()];
                    case 2:
                        result = _a.sent();
                        duration = Date.now() - start;
                        this.debug(context, "Async operation '".concat(operationName, "' completed"), { duration: duration });
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        duration = Date.now() - start;
                        this.error(context, "Async operation '".concat(operationName, "' failed"), error_1, { duration: duration });
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send alert for critical errors (placeholder for integration)
     */
    ExceptionManager.prototype.sendAlert = function (entry) {
        // Could integrate with:
        // - Sentry
        // - DataDog
        // - Slack
        // - Email service
        // For now, just log to console
        console.error("\n\uD83D\uDEA8 CRITICAL ALERT: [".concat(entry.context, "] ").concat(entry.message, "\n"));
    };
    /**
     * Force flush all pending logs
     */
    ExceptionManager.prototype.flush = function () {
        this.flushLogs();
    };
    /**
     * Get recent logs
     */
    ExceptionManager.prototype.getRecentLogs = function (count) {
        if (count === void 0) { count = 50; }
        try {
            var content = fs.readFileSync(this.logFile, 'utf-8');
            // Simple parsing - in production use structured logging
            return this.logBuffer.slice(-count);
        }
        catch (e) {
            this.warn('ExceptionManager', 'Failed to read log file', { error: String(e) });
            return this.logBuffer.slice(-count);
        }
    };
    /**
     * Clear old logs (keep last N days)
     */
    ExceptionManager.prototype.clearOldLogs = function (retentionDays) {
        var _this = this;
        if (retentionDays === void 0) { retentionDays = 7; }
        try {
            var logsDir_1 = path.dirname(this.logFile);
            var files = fs.readdirSync(logsDir_1);
            var now_1 = Date.now();
            var threshold_1 = retentionDays * 24 * 60 * 60 * 1000;
            files.forEach(function (file) {
                var filePath = path.join(logsDir_1, file);
                var stats = fs.statSync(filePath);
                if (now_1 - stats.mtime.getTime() > threshold_1) {
                    fs.removeSync(filePath);
                    _this.info('ExceptionManager', "Deleted old log file: ".concat(file));
                }
            });
        }
        catch (e) {
            this.warn('ExceptionManager', 'Failed to clear old logs', { error: String(e) });
        }
    };
    return ExceptionManager;
}());
// Create singleton instance
var exceptionManager = new ExceptionManager();
// Graceful shutdown handler
process.on('exit', function () {
    exceptionManager.flush();
});
process.on('SIGINT', function () {
    exceptionManager.flush();
    process.exit(0);
});
process.on('SIGTERM', function () {
    exceptionManager.flush();
    process.exit(0);
});
// Uncaught exception handler
process.on('uncaughtException', function (error) {
    exceptionManager.critical('Process', 'Uncaught Exception', error);
    exceptionManager.flush();
    process.exit(1);
});
// Unhandled promise rejection handler
process.on('unhandledRejection', function (reason, promise) {
    exceptionManager.critical('Process', 'Unhandled Promise Rejection', new Error(String(reason)), { promise: promise });
    exceptionManager.flush();
});
exports.default = exceptionManager;
