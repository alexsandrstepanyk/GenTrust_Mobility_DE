import fs from 'fs';
import path from 'path';

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
  module: string;
  message: string;
  stack?: string;
  userId?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
}

class ErrorLogger {
  private logs_dir = path.join(process.cwd(), 'logs');
  private current_date = new Date().toISOString().split('T')[0];
  private errors_file = path.join(this.logs_dir, `errors-${this.current_date}.json`);

  constructor() {
    this.ensure_logs_directory();
  }

  private ensure_logs_directory() {
    if (!fs.existsSync(this.logs_dir)) {
      fs.mkdirSync(this.logs_dir, { recursive: true });
    }
  }

  private generate_id() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  log_error(
    module: string,
    message: string,
    error?: Error,
    metadata?: Record<string, any>
  ) {
    const error_log: ErrorLog = {
      id: this.generate_id(),
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      module,
      message,
      stack: error?.stack,
      metadata,
      resolved: false,
    };

    this.write_log(error_log);
    console.error(`[ERROR] ${module}: ${message}`, error);
  }

  log_warning(
    module: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    const warning_log: ErrorLog = {
      id: this.generate_id(),
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      module,
      message,
      metadata,
      resolved: false,
    };

    this.write_log(warning_log);
    console.warn(`[WARNING] ${module}: ${message}`);
  }

  log_info(
    module: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    const info_log: ErrorLog = {
      id: this.generate_id(),
      timestamp: new Date().toISOString(),
      level: 'INFO',
      module,
      message,
      metadata,
      resolved: false,
    };

    this.write_log(info_log);
    console.log(`[INFO] ${module}: ${message}`);
  }

  private write_log(log: ErrorLog) {
    try {
      let logs: ErrorLog[] = [];

      if (fs.existsSync(this.errors_file)) {
        const content = fs.readFileSync(this.errors_file, 'utf-8');
        logs = JSON.parse(content);
      }

      logs.push(log);

      // Keep only last 1000 logs per file
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }

      fs.writeFileSync(
        this.errors_file,
        JSON.stringify(logs, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  get_recent_errors(limit: number = 50) {
    try {
      if (!fs.existsSync(this.errors_file)) return [];

      const content = fs.readFileSync(this.errors_file, 'utf-8');
      const logs: ErrorLog[] = JSON.parse(content);

      return logs
        .filter((log) => log.level === 'ERROR')
        .reverse()
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  get_all_logs(limit: number = 100) {
    try {
      if (!fs.existsSync(this.errors_file)) return [];

      const content = fs.readFileSync(this.errors_file, 'utf-8');
      const logs: ErrorLog[] = JSON.parse(content);

      return logs.reverse().slice(0, limit);
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  mark_resolved(log_id: string) {
    try {
      if (!fs.existsSync(this.errors_file)) return false;

      const content = fs.readFileSync(this.errors_file, 'utf-8');
      let logs: ErrorLog[] = JSON.parse(content);

      const log = logs.find((l) => l.id === log_id);
      if (log) {
        log.resolved = true;
      }

      fs.writeFileSync(
        this.errors_file,
        JSON.stringify(logs, null, 2),
        'utf-8'
      );

      return !!log;
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
      return false;
    }
  }

  get_statistics() {
    try {
      const logs = this.get_all_logs(1000);

      const errors = logs.filter((log) => log.level === 'ERROR').length;
      const warnings = logs.filter((log) => log.level === 'WARNING').length;
      const resolved = logs.filter((log) => log.resolved).length;
      const unresolved = errors - resolved;

      const by_module: Record<string, number> = {};
      logs.forEach((log) => {
        by_module[log.module] = (by_module[log.module] || 0) + 1;
      });

      return {
        total_logs: logs.length,
        errors,
        warnings,
        resolved,
        unresolved,
        by_module,
        last_error: logs[0],
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return null;
    }
  }
}

export const error_logger = new ErrorLogger();
