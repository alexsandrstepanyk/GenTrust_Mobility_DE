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
exports.analyzeImage = void 0;
var generative_ai_1 = require("@google/generative-ai");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables!");
}
var genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || "");
var analyzeImage = function (imageBuffer, description) { return __awaiter(void 0, void 0, void 0, function () {
    var model, prompt_1, imagePart, result, response, text, cleanedText, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                prompt_1 = "Analyze if this image shows a city infrastructure issue like a pothole, broken street light, garbage, or damaged public property. \n    Answer in strictly JSON format: { \"is_issue\": boolean, \"confidence\": number, \"category\": string }. \n    If isn't an issue, set category to \"none\".";
                if (description) {
                    prompt_1 += "\nThe user provided this description of the issue: \"".concat(description, "\". Take this into account.");
                }
                imagePart = {
                    inlineData: {
                        data: imageBuffer.toString("base64"),
                        mimeType: "image/jpeg",
                    },
                };
                return [4 /*yield*/, model.generateContent([prompt_1, imagePart])];
            case 1:
                result = _a.sent();
                return [4 /*yield*/, result.response];
            case 2:
                response = _a.sent();
                text = response.text();
                cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
                return [2 /*return*/, JSON.parse(cleanedText)];
            case 3:
                error_1 = _a.sent();
                console.error("Gemini Analysis Error:", error_1);
                return [2 /*return*/, { is_issue: false, confidence: 0, category: "error" }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.analyzeImage = analyzeImage;
