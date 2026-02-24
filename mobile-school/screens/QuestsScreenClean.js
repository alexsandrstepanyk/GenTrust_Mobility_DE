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
exports.default = QuestsScreenClean;
var react_1 = require("react");
var react_native_1 = require("react-native");
var axios_1 = require("axios");
var SecureStore = require("expo-secure-store");
var react_i18next_1 = require("react-i18next");
var native_1 = require("@react-navigation/native");
var config_1 = require("../config");
function QuestsScreenClean(_a) {
    var _this = this;
    var navigation = _a.navigation;
    var t = (0, react_i18next_1.useTranslation)().t;
    var _b = (0, react_1.useState)([]), quests = _b[0], setQuests = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), takingId = _d[0], setTakingId = _d[1];
    var isFetchingRef = (0, react_1.useRef)(false);
    var fetchQuests = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, fallback, e_1, status_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (isFetchingRef.current) {
                        console.log('[QUESTS DEBUG] Already fetching, skipping...');
                        return [2 /*return*/];
                    }
                    isFetchingRef.current = true;
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    return [4 /*yield*/, SecureStore.getItemAsync('userToken')];
                case 2:
                    token = _b.sent();
                    console.log('[QUESTS DEBUG] Token:', token ? 'exists' : 'missing');
                    console.log('[QUESTS DEBUG] Fetching from:', config_1.API_URL + "/quests/available");
                    if (!token) {
                        setLoading(false);
                        react_native_1.Alert.alert(t('login_required', 'Login required'), t('please_login', 'Please login to see quests.'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, axios_1.default.get("".concat(config_1.API_URL, "/quests/available"), {
                            headers: { Authorization: "Bearer ".concat(token) }
                        })];
                case 3:
                    res = _b.sent();
                    console.log('[QUESTS DEBUG] Response received:', res.data);
                    if (!(Array.isArray(res.data) && res.data.length === 0)) return [3 /*break*/, 5];
                    console.log('[QUESTS DEBUG] Empty response, fetching all');
                    return [4 /*yield*/, axios_1.default.get("".concat(config_1.API_URL, "/quests/available?all=true"), {
                            headers: { Authorization: "Bearer ".concat(token) }
                        })];
                case 4:
                    fallback = _b.sent();
                    setQuests(fallback.data);
                    return [3 /*break*/, 6];
                case 5:
                    setQuests(res.data);
                    _b.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_1 = _b.sent();
                    console.log('[QUESTS DEBUG] Error:', e_1);
                    console.log('[QUESTS DEBUG] Error response:', e_1 === null || e_1 === void 0 ? void 0 : e_1.response);
                    status_1 = (_a = e_1 === null || e_1 === void 0 ? void 0 : e_1.response) === null || _a === void 0 ? void 0 : _a.status;
                    if (status_1 === 401 || status_1 === 403) {
                        react_native_1.Alert.alert(t('session_expired', 'Session expired'), t('please_login', 'Please login to see quests.'));
                    }
                    else {
                        react_native_1.Alert.alert(t('error', 'Error'), t('quests_load_failed', 'Failed to load quests.'));
                    }
                    return [3 /*break*/, 9];
                case 8:
                    console.log('[QUESTS DEBUG] Setting loading to false');
                    isFetchingRef.current = false;
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); }, [t]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        console.log('[QUESTS DEBUG] Screen focused, starting fetch...');
        fetchQuests();
        var interval = setInterval(function() {
            console.log('[QUESTS DEBUG] Interval tick');
            fetchQuests();
        }, 30000);
        return function () { 
            console.log('[QUESTS DEBUG] Screen unfocused, clearing interval');
            clearInterval(interval); 
        };
    }, []));
    var handleTakeQuest = (0, react_1.useCallback)(function (questId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a, quest, pickupCode, deliveryCode, e_2, msg;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, 4, 5]);
                    setTakingId(questId);
                    return [4 /*yield*/, SecureStore.getItemAsync('userToken')];
                case 1:
                    token = _d.sent();
                    if (!token) {
                        react_native_1.Alert.alert(t('login_required', 'Login required'), t('please_login', 'Please login to see quests.'));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, axios_1.default.post("".concat(config_1.API_URL, "/quests/").concat(questId, "/take"), {}, {
                            headers: { Authorization: "Bearer ".concat(token) }
                        })];
                case 2:
                    res = _d.sent();
                    _a = res.data || {}, quest = _a.quest, pickupCode = _a.pickupCode, deliveryCode = _a.deliveryCode;
                    react_native_1.Alert.alert(t('success', 'Success'), t('quest_taken', 'Quest taken successfully.'));
                    fetchQuests();
                    if (quest) {
                        navigation.navigate('QuestDetails', { quest: quest, pickupCode: pickupCode, deliveryCode: deliveryCode });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    e_2 = _d.sent();
                    msg = ((_c = (_b = e_2 === null || e_2 === void 0 ? void 0 : e_2.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || t('quest_take_failed', 'Failed to take quest.');
                    react_native_1.Alert.alert(t('error', 'Error'), msg);
                    return [3 /*break*/, 5];
                case 4:
                    setTakingId(null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [fetchQuests, t, navigation]);
    if (loading)
        return (<react_native_1.View style={styles.loading}>
            <react_native_1.ActivityIndicator size="large" color="#007AFF"/>
        </react_native_1.View>);
    return (<react_native_1.SafeAreaView style={styles.safe}>
            <react_native_1.View style={styles.container}>
                <react_native_1.View style={styles.header}>
                    <react_native_1.Text style={styles.title}>🎒 {t('tasks')}</react_native_1.Text>
                    <react_native_1.Text style={styles.subtitle}>{t('quests_for_you', 'Quests in your area')}</react_native_1.Text>
                </react_native_1.View>

                <react_native_1.FlatList data={quests} keyExtractor={function (item) { return item.id; }} showsVerticalScrollIndicator={false} ListEmptyComponent={<react_native_1.View style={styles.empty}>
                            <react_native_1.Text style={styles.emptyText}>{t('no_quests', 'No quests found in your district.')}</react_native_1.Text>
                        </react_native_1.View>} renderItem={function (_a) {
            var item = _a.item;
            return (<react_native_1.TouchableOpacity style={styles.card} onPress={function () { return react_native_1.Alert.alert(item.title, item.description || t('no_description', 'No description provided.')); }}>
                            <react_native_1.View style={styles.cardHeader}>
                                <react_native_1.Text style={styles.questTitle}>{item.title}</react_native_1.Text>
                                <react_native_1.Text style={styles.reward}>{item.reward}€</react_native_1.Text>
                            </react_native_1.View>
                            <react_native_1.Text style={styles.description} numberOfLines={2}>{item.description}</react_native_1.Text>
                            <react_native_1.View style={styles.footer}>
                                <react_native_1.Text style={styles.location}>📍 {[item.district, item.city].filter(Boolean).join(', ')}</react_native_1.Text>
                                <react_native_1.TouchableOpacity style={styles.takeButton} disabled={takingId === item.id} onPress={function () { return handleTakeQuest(item.id); }}>
                                    <react_native_1.Text style={styles.takeButtonText}>
                                        {takingId === item.id ? t('loading', 'Loading...') : t('take_quest', 'Get order')}
                                    </react_native_1.Text>
                                </react_native_1.TouchableOpacity>
                            </react_native_1.View>
                        </react_native_1.TouchableOpacity>);
        }}/>
            </react_native_1.View>
        </react_native_1.SafeAreaView>);
}
var styles = react_native_1.StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 20 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 24, marginTop: 10 },
    title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
    subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    questTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', flex: 1 },
    reward: { color: '#34C759', fontSize: 18, fontWeight: '800', marginLeft: 10 },
    description: { color: '#666', fontSize: 14, lineHeight: 20, marginBottom: 12 },
    footer: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
    location: { color: '#007AFF', fontSize: 12, fontWeight: '600' },
    takeButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
        alignSelf: 'flex-start'
    },
    takeButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#aaa', fontSize: 16 }
});
