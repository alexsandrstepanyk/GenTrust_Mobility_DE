# ExceptionManager System Documentation

## 概述
ExceptionManager 是一個集中式的錯誤處理和日誌管理系統，為整個應用提供一致的日誌記錄、錯誤追蹤和調試功能。

## 功能

### 1. **分級日誌記錄**
- `DEBUG` - 開發除錯信息
- `INFO` - 常規操作信息
- `WARN` - 警告信息
- `ERROR` - 錯誤信息
- `CRITICAL` - 系統關鍵錯誤

### 2. **自動日誌輪換**
- 按日期自動創建日誌文件（`.logs/app-YYYY-MM-DD.log`）
- 支持配置日誌保留期限（默認7天）
- 自動清理過期日誌

### 3. **彩色控制台輸出**
- 根據日誌級別自動著色
- 易於在終端識別不同的日誌級別

### 4. **結構化日誌**
- 時間戳
- 日誌級別
- 上下文（模塊名稱）
- 詳細消息
- 操作耗時（支持同步和異步操作）
- 堆棧跟蹤（用於錯誤）
- 自定義數據

### 5. **全局異常處理**
自動捕捉：
- 未捕獲異常 (`uncaughtException`)
- 未處理的Promise拒絕 (`unhandledRejection`)
- 優雅關閉處理

### 6. **性能監控**
```typescript
// 同步操作計時
exceptionManager.timeOperation('UserService', 'getUserData', () => {
  return getUserFromDatabase(userId);
});

// 異步操作計時
await exceptionManager.timeAsyncOperation('APIService', 'fetchUserQuests', async () => {
  return await axios.get('/api/quests');
});
```

## 使用示例

### 基礎日誌記錄

```typescript
import exceptionManager from './services/exception_manager';

// DEBUG級別
exceptionManager.debug('MyModule', 'Variable value is:', { value: 42 });

// INFO級別
exceptionManager.info('MyModule', 'Operation started');

// WARN級別
exceptionManager.warn('MyModule', 'Deprecated function used', { functionName: 'oldFunc' });

// ERROR級別（帶堆棧跟蹤）
try {
  await someAsyncOperation();
} catch (error) {
  exceptionManager.error('MyModule', 'Operation failed', error, { userId: 123 });
}

// CRITICAL級別（觸發警報）
exceptionManager.critical('SecurityModule', 'Unauthorized access attempt', error, {
  attemptedUserId: 999,
  ipAddress: '192.168.1.1'
});
```

### 異常處理和追蹤

```typescript
// 自動生成異常ID用於追蹤
const exceptionId = exceptionManager.handleException('PaymentService', error, {
  transactionId: 'txn_123',
  amount: 99.99
});

// 返回異常ID可以發送給用戶
console.log(`Please report this error ID: ${exceptionId}`);
```

### 集成到Telegram機器人

```typescript
bot.catch((err: any, ctx: BotContext) => {
  const exceptionId = exceptionManager.handleException('ScoutBot', err, {
    updateType: ctx.updateType,
    userId: ctx.from?.id,
    command: ctx.update.message?.text
  });

  ctx.reply(`❌ Error occurred. Support ID: ${exceptionId}`);
});
```

### 集成到Express API

```typescript
app.use((err: any, req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  const exceptionId = exceptionManager.handleException('API', err, {
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  res.status(500).json({
    error: 'Internal Server Error',
    supportId: exceptionId
  });
});
```

## 日誌文件位置

```
.logs/
├── app-2026-02-13.log
├── app-2026-02-12.log
└── app-2026-02-11.log
```

## 日誌輸出格式

### 控制台（彩色）
```
[2026-02-13T12:34:56.789Z] [INFO] [ScoutBot][45ms] 'Command /start executed'
[2026-02-13T12:34:57.123Z] [ERROR] [PaymentService] 'Transaction failed'
  Stack: Error: Insufficient funds at PaymentService.process...
```

### 文件格式
```
[2026-02-13T12:34:56.789Z] [INFO] [ScoutBot][45ms] Command /start executed
[2026-02-13T12:34:57.123Z] [ERROR] [PaymentService] Transaction failed
  Data: {"transactionId":"txn_123","amount":99.99}
```

## 配置

### 環境變量
```bash
NODE_ENV=production  # 不在全局存儲prisma實例
NODE_ENV=development # 存儲prisma實例供重用
```

### 日誌保留策略

```typescript
// 清理7天前的日誌
exceptionManager.clearOldLogs(7);

// 清理30天前的日誌
exceptionManager.clearOldLogs(30);
```

## 最佳實踐

1. **使用適當的日誌級別**
   - DEBUG：開發過程中的詳細信息
   - INFO：重要的業務事件
   - WARN：可能的問題，但應用仍可運行
   - ERROR：應用可恢復的錯誤
   - CRITICAL：應用無法恢復的錯誤

2. **包含上下文信息**
   ```typescript
   exceptionManager.error('UserService', 'Failed to fetch user', error, {
     userId: user.id,
     requestId: req.id,
     timestamp: new Date()
   });
   ```

3. **為用戶提供支持ID**
   ```typescript
   const exceptionId = exceptionManager.handleException('Module', error);
   return res.status(500).json({
     error: 'Something went wrong',
     supportId: exceptionId,
     message: 'Contact support with ID above'
   });
   ```

4. **監控關鍵操作**
   ```typescript
   await exceptionManager.timeAsyncOperation(
     'DatabaseModule',
     'MigrateData',
     async () => {
       // Database migration code
     }
   );
   ```

5. **集成到CI/CD**
   - 監控日誌文件用於異常錯誤
   - 根據CRITICAL級別日誌發送警報
   - 定期分析錯誤模式

## 故障排除

### 日誌未寫入文件
- 檢查 `.logs` 目錄權限
- 驗證磁盤空間充足
- 檢查文件系統錯誤

### 性能影響
- ExceptionManager使用緩衝機制減少磁盤I/O
- 超過100條日誌時自動刷新
- 在優雅關閉時確保所有日誌被寫入

### 內存使用
- 默認緩衝區大小為100條日誌
- 可配置以平衡性能和內存
- 建議監控內存使用情況

## 集成檢查清單

- [x] 在主入口點導入ExceptionManager
- [x] 集成到Bot.catch()錯誤處理
- [x] 集成到Express錯誤中間件
- [x] 配置全局異常處理器
- [x] 在關鍵業務邏輯中添加日誌
- [ ] 設置日誌分析和監控
- [ ] 創建錯誤報告儀表板
- [ ] 配置警報通知（Slack/Email）

## 版本歷史

### v1.0.0 (2026-02-13)
- 初始發佈
- 核心日誌記錄功能
- 自動異常捕捉
- 日誌輪換和保留
