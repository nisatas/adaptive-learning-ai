"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveQuizResult = saveQuizResult;
exports.getLastQuizResult = getLastQuizResult;
exports.hasQuizResult = hasQuizResult;
exports.getLastSubmitAt = getLastSubmitAt;
exports.addStudentNotification = addStudentNotification;
exports.getStudentNotifications = getStudentNotifications;
const lastResultsByStudent = new Map();
const notificationsByStudent = new Map();
let lastSubmitAt = null;
let notificationCounter = 0;
function saveQuizResult(result) {
    lastResultsByStudent.set(result.studentId, result);
    lastSubmitAt = result.submittedAt;
}
function getLastQuizResult(studentId) {
    return lastResultsByStudent.get(studentId);
}
function hasQuizResult(studentId) {
    return lastResultsByStudent.has(studentId);
}
function getLastSubmitAt() {
    return lastSubmitAt ?? new Date().toISOString();
}
function addStudentNotification(studentId, notification) {
    const id = notification.id ??
        `noti-${++notificationCounter}-${Date.now().toString(36)}`;
    const stored = {
        id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        lesson: notification.lesson,
        topic: notification.topic,
        duration: notification.duration,
        status: notification.status,
    };
    const existing = notificationsByStudent.get(studentId) ?? [];
    notificationsByStudent.set(studentId, [stored, ...existing]);
    return stored;
}
function getStudentNotifications(studentId) {
    return [...(notificationsByStudent.get(studentId) ?? [])];
}
//# sourceMappingURL=inMemoryStore.js.map