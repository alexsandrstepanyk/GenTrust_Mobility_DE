"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var auth_1 = require("./routes/auth");
var reports_1 = require("./routes/reports");
var quests_1 = require("./routes/quests");
var leaderboard_1 = require("./routes/leaderboard");
var morgan_1 = require("morgan");
var error_1 = require("./middleware/error");
var exception_manager_1 = require("../services/exception_manager");
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
var PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/quests', quests_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
// Health check endpoints
app.get('/health', function (req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', function (req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling
app.use(error_1.errorHandler);
app.listen(PORT, function () {
    exception_manager_1.default.info("API", "GenTrust API Server running on port ".concat(PORT));
    console.log("\uD83D\uDE80 GenTrust API Server running on port ".concat(PORT));
});
exports.default = app;
