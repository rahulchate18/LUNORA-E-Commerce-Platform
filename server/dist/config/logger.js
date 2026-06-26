import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// ES modules workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.resolve(__dirname, "../../../logs");
// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
const COLORS = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
};
// Return path to the daily log file: logs/app-YYYY-MM-DD.log
function getLogFilePath() {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return path.join(LOG_DIR, `app-${date}.log`);
}
// Periodically evict log files older than 7 days (runs once every 12 hours max)
let lastCleanTime = 0;
function cleanOldLogs() {
    const now = Date.now();
    if (now - lastCleanTime < 12 * 60 * 60 * 1000)
        return;
    lastCleanTime = now;
    try {
        const files = fs.readdirSync(LOG_DIR);
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        files.forEach((file) => {
            const filePath = path.join(LOG_DIR, file);
            const stats = fs.statSync(filePath);
            if (stats.mtimeMs < sevenDaysAgo) {
                fs.unlinkSync(filePath);
                logger.info(`Log Manager: Evicted old log file: ${file}`);
            }
        });
    }
    catch (err) {
        console.error("Log Manager: Failed to prune old logs:", err);
    }
}
// Format error stack or return raw meta
function serializeMeta(meta) {
    if (meta instanceof Error) {
        return {
            message: meta.message,
            name: meta.name,
            stack: meta.stack,
            ...meta,
        };
    }
    return meta;
}
// Structured log file appender
function appendToFile(level, message, meta) {
    try {
        const timestamp = new Date().toISOString();
        const logLine = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...(meta !== undefined ? { metadata: serializeMeta(meta) } : {}),
        };
        fs.appendFileSync(getLogFilePath(), JSON.stringify(logLine) + "\n", "utf8");
        cleanOldLogs();
    }
    catch (err) {
        console.error("Log Manager: Failed writing log file stream:", err);
    }
}
// Color console formatter
function formatConsoleMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    let color = COLORS.reset;
    let levelLabel = level.toUpperCase();
    switch (level) {
        case "info":
            color = COLORS.green;
            break;
        case "warn":
            color = COLORS.yellow;
            break;
        case "error":
            color = COLORS.red;
            break;
    }
    const metaString = meta !== undefined
        ? `\n${COLORS.dim}${JSON.stringify(serializeMeta(meta), null, 2)}${COLORS.reset}`
        : "";
    return `${COLORS.dim}[${timestamp}]${COLORS.reset} ${color}${levelLabel}:${COLORS.reset} ${message}${metaString}`;
}
export const logger = {
    info(message, meta) {
        // 1. Output colored log to console
        console.log(formatConsoleMessage("info", message, meta));
        // 2. Append structured log to rotating file
        appendToFile("info", message, meta);
    },
    warn(message, meta) {
        console.warn(formatConsoleMessage("warn", message, meta));
        appendToFile("warn", message, meta);
    },
    error(message, meta) {
        console.error(formatConsoleMessage("error", message, meta));
        appendToFile("error", message, meta);
    },
};
//# sourceMappingURL=logger.js.map