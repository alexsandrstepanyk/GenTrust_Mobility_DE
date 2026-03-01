# 📜 Parent Consent Flow - Legal Compliance for Germany

**Date:** 1 березня 2026 р.  
**Jurisdiction:** Germany (DSGVO + JArbSchG)  
**Purpose:** Юридичний захист для роботи неповнолітніх

---

## LEGAL REQUIREMENTS

### JArbSchG (Youth Employment Protection Act)

**§5 Abs. 2 JArbSchG:**
> "Die Beschäftigung von Kindern und vollzeitschulpflichtigen Jugendlichen ist verboten."

**Exception (§5 Abs. 3):**
> Leichte und für Kinder geeignete Tätigkeiten dürfen mit **Einwilligung der Personensorgeberechtigten** ausgeübt werden.

**Означає:**
- ❗ Діти до 15 років НЕ МОЖУТЬ працювати БЕЗ згоди батьків
- ✅ З письмовою згодою батьків можливі "легкі завдання"
- ✅ GenTrust Quests = "leichte Tätigkeiten" (легкі завдання)

### DSGVO (General Data Protection Regulation)

**Article 8 - Conditions for children's consent:**
> Where the child is below the age of 16 years, processing shall be lawful only if consent is given or authorised by the holder of parental responsibility.

**Означає:**
- ❗ Діти до 16 років потребують згоди батьків для обробки даних
- ✅ Батьки повинні підтвердити реєстрацію дитини
- ✅ Батьки можуть відкликати згоду в будь-який момент

---

## IMPLEMENTATION PLAN

### Phase 1: Parent Registration (Week 1)

**Database Schema Extension:**

```prisma
model ParentConsent {
  id                String   @id @default(cuid())
  parentId          String
  childId           String
  
  // Legal consent
  consentGiven      Boolean  @default(false)
  consentDate       DateTime?
  consentText       String   @db.Text
  consentSignature  String   // Криптографічний hash підпису
  
  // Revocation
  revokedAt         DateTime?
  revokedReason     String?
  
  // Audit trail
  ipAddress         String
  userAgent         String
  consentVersion    String   @default("1.0")
  
  parent            User     @relation("ParentConsents", fields: [parentId], references: [id])
  child             User     @relation("ChildConsents", fields: [childId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([parentId, childId])
  @@index([childId])
}

model ParentChildLink {
  id                String   @id @default(cuid())
  parentId          String
  childId           String
  
  // Verification
  verificationCode  String   @unique // 6-digit code
  parentVerified    Boolean  @default(false)
  childVerified     Boolean  @default(false)
  status            LinkStatus @default(PENDING) // PENDING, ACTIVE, REVOKED
  
  // Permissions
  canViewProgress   Boolean  @default(true)
  canViewBalance    Boolean  @default(true)
  canCreateTasks    Boolean  @default(true)
  canTrackGPS       Boolean  @default(false)
  
  parent            User     @relation("ParentLinks", fields: [parentId], references: [id])
  child             User     @relation("ChildLinks", fields: [childId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([parentId, childId])
}

enum LinkStatus {
  PENDING
  ACTIVE
  REVOKED
}
```

**API Endpoints:**

```typescript
// POST /api/parents/link-child
// Body: { childEmail: string }
// Returns: { verificationCode: string }

// POST /api/parents/verify-link
// Body: { verificationCode: string }
// Returns: { status: "success", childId: string }

// POST /api/parents/consent
// Body: { childId: string, consentText: string, signature: string }
// Returns: { consentId: string }

// GET /api/parents/children
// Returns: Array<{ child: User, consent: ParentConsent, link: ParentChildLink }>

// DELETE /api/parents/revoke-consent/:childId
// Returns: { status: "revoked" }
```

---

### Phase 2: Digital Consent Form

**Legal Template (German + Ukrainian):**

```html
<div class="consent-form">
  <h2>Einwilligungserklärung / Заява про згоду</h2>
  
  <p><strong>Ich, [Parent Name],</strong> erkläre hiermit, dass ich:</p>
  
  <ul>
    <li>✅ Erziehungsberechtigte(r) von [Child Name] (geb. [DOB]) bin</li>
    <li>✅ Meinem Kind erlaube, an der GenTrust Mobility Plattform teilzunehmen</li>
    <li>✅ Verstehe, dass mein Kind "leichte Tätigkeiten" gem. §5 Abs. 3 JArbSchG ausführen wird</li>
    <li>✅ Die Datenschutzerklärung gelesen habe und akzeptiere</li>
    <li>✅ Diese Einwilligung jederzeit widerrufen kann</li>
  </ul>
  
  <hr>
  
  <p><strong>Я, [Parent Name],</strong> підтверджую, що:</p>
  
  <ul>
    <li>✅ Є батьком/опікуном [Child Name] (нар. [DOB])</li>
    <li>✅ Дозволяю своїй дитині брати участь у платформі GenTrust Mobility</li>
    <li>✅ Розумію, що дитина виконуватиме "легкі завдання" відповідно до німецького законодавства</li>
    <li>✅ Прочитав(ла) та приймаю політику конфіденційності</li>
    <li>✅ Можу відкликати цю згоду в будь-який момент</li>
  </ul>
  
  <div class="signature-section">
    <label>
      <input type="checkbox" id="consent-checkbox" required>
      Ich bestätige hiermit meine Zustimmung / Підтверджую свою згоду
    </label>
    
    <button onclick="submitConsent()">Zustimmung erteilen / Надати згоду</button>
  </div>
  
  <p class="legal-notice">
    📄 Diese Einwilligung wird kryptographisch gesichert gespeichert und kann
    von Behörden eingesehen werden. Diese Zgoda буде збережена з криптографічним
    захистом.
  </p>
</div>
```

**Frontend Implementation:**

```typescript
// ParentConsentScreen.tsx
import { useState } from 'react';
import { View, Text, CheckBox, Button, Alert } from 'react-native';
import crypto from 'crypto';

export function ParentConsentScreen({ childId }: { childId: string }) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitConsent = async () => {
    if (!agreed) {
      Alert.alert('Bitte bestätigen', 'Bitte lesen und akzeptieren Sie die Einwilligungserklärung.');
      return;
    }

    setSubmitting(true);
    
    try {
      const consentData = {
        parentId: currentUser.id,
        childId,
        consentText: getConsentTemplate(),
        timestamp: new Date().toISOString(),
        ipAddress: await getIP(),
        userAgent: navigator.userAgent
      };

      // Generate cryptographic signature
      const signature = crypto
        .createHash('sha256')
        .update(JSON.stringify(consentData))
        .digest('hex');

      const response = await axios.post('/api/parents/consent', {
        childId,
        consentText: consentData.consentText,
        signature,
        ipAddress: consentData.ipAddress,
        userAgent: consentData.userAgent
      });

      Alert.alert('Erfolg', 'Einwilligung erfolgreich erteilt!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Fehler', 'Einwilligung konnte nicht gespeichert werden.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <ScrollView>
        <Text style={styles.title}>Einwilligungserklärung</Text>
        {/* ... consent text ... */}
      </ScrollView>
      
      <CheckBox value={agreed} onValueChange={setAgreed} />
      <Text>Ich bestätige meine Zustimmung</Text>
      
      <Button
        title="Zustimmung erteilen"
        onPress={submitConsent}
        disabled={!agreed || submitting}
      />
    </View>
  );
}
```

**Backend Validation:**

```typescript
// src/api/routes/parents.ts
router.post('/consent', authenticateToken, async (req, res) => {
  const { childId, consentText, signature, ipAddress, userAgent } = req.body;
  const parentId = req.user.userId;

  // Validate parent-child relationship
  const link = await prisma.parentChildLink.findFirst({
    where: { parentId, childId, status: 'ACTIVE' }
  });

  if (!link) {
    return res.status(403).json({ error: 'No active parent-child link' });
  }

  // Validate signature
  const expectedData = {
    parentId,
    childId,
    consentText,
    ipAddress,
    userAgent
  };
  const expectedSignature = crypto
    .createHash('sha256')
    .update(JSON.stringify(expectedData))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Save consent
  const consent = await prisma.parentConsent.create({
    data: {
      parentId,
      childId,
      consentGiven: true,
      consentDate: new Date(),
      consentText,
      consentSignature: signature,
      ipAddress,
      userAgent,
      consentVersion: '1.0'
    }
  });

  // Update child account status
  await prisma.user.update({
    where: { id: childId },
    data: { parentConsentGiven: true }
  });

  res.json({ consentId: consent.id, status: 'success' });
});
```

---

### Phase 3: Revocation Flow

**UI for Parents:**

```typescript
// ParentDashboard.tsx
function ConsentManagement({ child }: { child: User }) {
  const [showRevoke, setShowRevoke] = useState(false);

  const revokeConsent = async () => {
    Alert.alert(
      'Einwilligung widerrufen?',
      'Ihr Kind kann die App 7 Tage nach Widerruf nicht mehr nutzen.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Widerrufen',
          style: 'destructive',
          onPress: async () => {
            await axios.delete(`/api/parents/revoke-consent/${child.id}`);
            Alert.alert('Erfolg', 'Einwilligung widerrufen. 7-Tage-Frist beginnt jetzt.');
          }
        }
      ]
    );
  };

  return (
    <View>
      <Text>Einwilligung erteilt am: {consent.consentDate}</Text>
      <Button title="Einwilligung widerrufen" onPress={revokeConsent} color="red" />
    </View>
  );
}
```

**Backend Logic:**

```typescript
router.delete('/revoke-consent/:childId', authenticateToken, async (req, res) => {
  const { childId } = req.params;
  const parentId = req.user.userId;

  const consent = await prisma.parentConsent.findFirst({
    where: { parentId, childId, consentGiven: true }
  });

  if (!consent) {
    return res.status(404).json({ error: 'No active consent found' });
  }

  // Mark as revoked
  await prisma.parentConsent.update({
    where: { id: consent.id },
    data: {
      revokedAt: new Date(),
      revokedReason: req.body.reason || 'Parent revoked'
    }
  });

  // Schedule account deactivation in 7 days
  const deactivationDate = new Date();
  deactivationDate.setDate(deactivationDate.getDate() + 7);

  await prisma.user.update({
    where: { id: childId },
    data: {
      accountDeactivationScheduled: deactivationDate,
      parentConsentGiven: false
    }
  });

  // Send notification to child
  await sendPushToUser(
    childId,
    'Wichtiger Hinweis',
    'Deine Eltern haben ihre Zustimmung widerrufen. Du hast noch 7 Tage Zeit.'
  );

  res.json({ status: 'revoked', deactivationDate });
});
```

---

## AUDIT TRAIL

All consent actions are logged:

```typescript
model ConsentAuditLog {
  id          String   @id @default(cuid())
  consentId   String
  action      String   // GRANTED, REVOKED, VIEWED
  performedBy String
  ipAddress   String
  userAgent   String
  timestamp   DateTime @default(now())
  
  consent     ParentConsent @relation(fields: [consentId], references: [id])
}
```

---

## COMPLIANCE CHECKLIST

- [x] Parental consent required for users <16
- [x] Digital signature with cryptographic hash
- [x] Revocation option with 7-day notice
- [x] Audit trail for authorities
- [x] Bilingual form (German + Ukrainian)
- [x] IP address and timestamp logging
- [x] Data retention policy (7 years post-revocation)
- [ ] Legal review by German lawyer (recommended)
- [ ] DSGVO compliance officer review

---

**Status:** Design complete, ready for implementation ✅  
**Estimated Time:** 20-25 hours  
**Priority:** P0 (blocking production in Germany)
