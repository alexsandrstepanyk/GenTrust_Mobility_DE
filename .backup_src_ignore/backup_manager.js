"use strict";
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
exports.runBackup = runBackup;
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var SRC_DIR = path_1.default.join(__dirname, '../src');
var ENV_FILE = path_1.default.join(__dirname, '../.env');
var BACKUP_ROOT = path_1.default.join(__dirname, '../backups');
function runBackup() {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, backupDir, backups, sorted, toDelete, _i, toDelete_1, dir, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 13, , 14]);
                    timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    backupDir = path_1.default.join(BACKUP_ROOT, timestamp);
                    return [4 /*yield*/, fs_extra_1.default.ensureDir(backupDir)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.pathExists(SRC_DIR)];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs_extra_1.default.copy(SRC_DIR, path_1.default.join(backupDir, 'src'))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, fs_extra_1.default.pathExists(ENV_FILE)];
                case 5:
                    if (!_a.sent()) return [3 /*break*/, 7];
                    return [4 /*yield*/, fs_extra_1.default.copy(ENV_FILE, path_1.default.join(backupDir, '.env'))];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    console.log("[Backup] \u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430 \u043A\u043E\u043F\u0456\u044F \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0430: ".concat(timestamp));
                    return [4 /*yield*/, fs_extra_1.default.readdir(BACKUP_ROOT)];
                case 8:
                    backups = _a.sent();
                    if (!(backups.length > 10)) return [3 /*break*/, 12];
                    sorted = backups.sort();
                    toDelete = sorted.slice(0, backups.length - 10);
                    _i = 0, toDelete_1 = toDelete;
                    _a.label = 9;
                case 9:
                    if (!(_i < toDelete_1.length)) return [3 /*break*/, 12];
                    dir = toDelete_1[_i];
                    return [4 /*yield*/, fs_extra_1.default.remove(path_1.default.join(BACKUP_ROOT, dir))];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_1 = _a.sent();
                    console.error('[Backup] Помилка резервного копіювання:', error_1);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
// Запуск кожні 30 секунд
if (require.main === module) {
    console.log('[Backup] Менеджер бекапів запущено (30с)');
    setInterval(runBackup, 30000);
}
