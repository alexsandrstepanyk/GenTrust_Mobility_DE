const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API = 'http://localhost:3000/api';
const now = Date.now();
const tinyPath = '/tmp/proof.png';

const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7+9L0AAAAASUVORK5CYII=';
fs.writeFileSync(tinyPath, Buffer.from(tinyPngBase64, 'base64'));

async function api(path, { method = 'GET', token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !form) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: form ? form : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

(async () => {
  const report = { timestamp: new Date().toISOString(), checks: [] };

  const requesterEmail = `requester_${now}@test.com`;
  const studentEmail = `student_${now}@test.com`;
  const parentEmail = `parent_${now}@test.com`;
  const childEmail = `child_${now}@test.com`;
  const password = 'admin123';

  const requesterReg = await api('/auth/register', { method: 'POST', body: { email: requesterEmail, password, firstName: 'Req', lastName: 'Client', city: 'Wurzburg', district: 'Zellerau' } });
  if (!requesterReg.ok) throw new Error(`Requester register failed: ${JSON.stringify(requesterReg)}`);
  await prisma.user.update({ where: { id: requesterReg.data.user.id }, data: { status: 'ACTIVE', role: 'ADMIN' } });
  const requesterLogin = await api('/auth/login', { method: 'POST', body: { email: requesterEmail, password } });
  if (!requesterLogin.ok) throw new Error(`Requester login failed: ${JSON.stringify(requesterLogin)}`);
  const requesterToken = requesterLogin.data.token;

  const studentReg = await api('/auth/register', { method: 'POST', body: { email: studentEmail, password, firstName: 'Stu', lastName: 'Dent', city: 'Wurzburg', district: 'Zellerau' } });
  if (!studentReg.ok) throw new Error(`Student register failed: ${JSON.stringify(studentReg)}`);
  await prisma.user.update({ where: { id: studentReg.data.user.id }, data: { status: 'ACTIVE', role: 'SCOUT' } });
  const studentLogin = await api('/auth/login', { method: 'POST', body: { email: studentEmail, password } });
  if (!studentLogin.ok) throw new Error(`Student login failed: ${JSON.stringify(studentLogin)}`);
  const studentToken = studentLogin.data.token;

  const orderRes = await api('/task-orders', { method: 'POST', token: requesterToken, body: { title: `Order ${now}`, description: 'Do task', budget: 15, city: 'Wurzburg', district: 'Zellerau', location: 'Center' } });
  if (!orderRes.ok) throw new Error(`TaskOrder create failed: ${JSON.stringify(orderRes)}`);

  const approveOrderRes = await api(`/task-orders/${orderRes.data.id}/approve`, { method: 'POST', token: requesterToken });
  if (!approveOrderRes.ok) throw new Error(`TaskOrder approve failed: ${JSON.stringify(approveOrderRes)}`);
  const questFromOrder = approveOrderRes.data.quest;

  const takeRes = await api(`/quests/${questFromOrder.id}/take`, { method: 'POST', token: studentToken });
  if (!takeRes.ok) throw new Error(`Take quest failed: ${JSON.stringify(takeRes)}`);

  const formClient = new FormData();
  formClient.append('code', takeRes.data.deliveryCode);
  formClient.append('latitude', '49.7913');
  formClient.append('longitude', '9.9534');
  formClient.append('description', 'Client flow proof');
  formClient.append('photo', new Blob([fs.readFileSync(tinyPath)], { type: 'image/png' }), 'proof.png');

  const completeClientRes = await api(`/quests/${questFromOrder.id}/complete`, { method: 'POST', token: studentToken, form: formClient });
  if (!completeClientRes.ok) throw new Error(`Complete quest (client flow) failed: ${JSON.stringify(completeClientRes)}`);

  const pendingForRequester = await api('/completions/pending', { token: requesterToken });
  if (!pendingForRequester.ok) throw new Error(`Pending for requester failed: ${JSON.stringify(pendingForRequester)}`);
  const clientCompletion = pendingForRequester.data.find((x) => x.questId === questFromOrder.id || x.quest?.id === questFromOrder.id);
  if (!clientCompletion) throw new Error('Client completion not found in pending list');

  const approveCompletionRes = await api(`/completions/${clientCompletion.id}/approve`, { method: 'POST', token: requesterToken, body: {} });
  if (!approveCompletionRes.ok) throw new Error(`Approve completion failed: ${JSON.stringify(approveCompletionRes)}`);

  const studentAfterApprove = await prisma.user.findUnique({ where: { id: studentReg.data.user.id }, select: { balance: true } });
  const completionAfterApprove = await prisma.taskCompletion.findUnique({ where: { id: clientCompletion.id }, select: { status: true, rewardPaid: true } });

  report.checks.push({
    name: 'Client flow approve',
    result: completionAfterApprove?.status === 'APPROVED' && completionAfterApprove?.rewardPaid === true,
    details: { completionStatus: completionAfterApprove?.status, rewardPaid: completionAfterApprove?.rewardPaid, studentBalance: studentAfterApprove?.balance }
  });

  const parentReg = await api('/parents/register', { method: 'POST', body: { email: parentEmail, password, firstName: 'Par', lastName: 'Ent' } });
  if (!parentReg.ok) throw new Error(`Parent register failed: ${JSON.stringify(parentReg)}`);

  const parentLogin = await api('/auth/login', { method: 'POST', body: { email: parentEmail, password } });
  if (!parentLogin.ok) throw new Error(`Parent login failed: ${JSON.stringify(parentLogin)}`);
  const parentToken = parentLogin.data.token;

  const childReg = await api('/auth/register', { method: 'POST', body: { email: childEmail, password, firstName: 'Child', lastName: 'One', city: 'Wurzburg', district: 'Zellerau' } });
  if (!childReg.ok) throw new Error(`Child register failed: ${JSON.stringify(childReg)}`);
  await prisma.user.update({ where: { id: childReg.data.user.id }, data: { status: 'ACTIVE', role: 'SCOUT' } });
  const childLogin = await api('/auth/login', { method: 'POST', body: { email: childEmail, password } });
  if (!childLogin.ok) throw new Error(`Child login failed: ${JSON.stringify(childLogin)}`);
  const childToken = childLogin.data.token;

  await prisma.parentChild.create({
    data: {
      parentId: parentLogin.data.user.id,
      childId: childReg.data.user.id,
      status: 'APPROVED',
      canCreateTasks: true,
      canTrackGPS: true,
      canViewQuests: true,
      approvedAt: new Date(),
      approvedBy: parentLogin.data.user.id
    }
  });

  const createTaskRes = await api('/parents/create-task', { method: 'POST', token: parentToken, body: { childId: childReg.data.user.id, title: `Parent Task ${now}`, description: 'clean room', reward: 7 } });
  if (!createTaskRes.ok) throw new Error(`Parent create-task failed: ${JSON.stringify(createTaskRes)}`);
  const parentQuestId = createTaskRes.data.quest.id;

  const takeParentQuest = await api(`/quests/${parentQuestId}/take`, { method: 'POST', token: childToken });
  if (!takeParentQuest.ok) throw new Error(`Child take parent quest failed: ${JSON.stringify(takeParentQuest)}`);

  const formParent = new FormData();
  formParent.append('code', takeParentQuest.data.deliveryCode);
  formParent.append('latitude', '49.7900');
  formParent.append('longitude', '9.9500');
  formParent.append('description', 'Parent flow proof');
  formParent.append('photo', new Blob([fs.readFileSync(tinyPath)], { type: 'image/png' }), 'proof2.png');

  const completeParentRes = await api(`/quests/${parentQuestId}/complete`, { method: 'POST', token: childToken, form: formParent });
  if (!completeParentRes.ok) throw new Error(`Complete quest (parent flow) failed: ${JSON.stringify(completeParentRes)}`);

  const pendingForParent = await api('/completions/pending', { token: parentToken });
  if (!pendingForParent.ok) throw new Error(`Pending for parent failed: ${JSON.stringify(pendingForParent)}`);
  const parentCompletion = pendingForParent.data.find((x) => x.questId === parentQuestId || x.quest?.id === parentQuestId);
  if (!parentCompletion) throw new Error('Parent completion not found in pending list');

  const rejectRes = await api(`/completions/${parentCompletion.id}/reject`, { method: 'POST', token: parentToken, body: { reason: 'Недостатньо доказів' } });
  if (!rejectRes.ok) throw new Error(`Reject completion failed: ${JSON.stringify(rejectRes)}`);

  const completionAfterReject = await prisma.taskCompletion.findUnique({ where: { id: parentCompletion.id }, select: { status: true, rejectionReason: true } });
  const questAfterReject = await prisma.quest.findUnique({ where: { id: parentQuestId }, select: { status: true } });

  report.checks.push({
    name: 'Parent flow reject',
    result: completionAfterReject?.status === 'REJECTED' && questAfterReject?.status === 'IN_PROGRESS',
    details: { completionStatus: completionAfterReject?.status, questStatus: questAfterReject?.status, reason: completionAfterReject?.rejectionReason }
  });

  report.success = report.checks.every((c) => c.result === true);
  fs.writeFileSync('/tmp/e2e_photo_verification_report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('E2E FAILED:', e);
  await prisma.$disconnect();
  process.exit(1);
});
