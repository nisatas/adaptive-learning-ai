"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentDashboardServiceError = void 0;
exports.getStudentDashboard = getStudentDashboard;
const mockData_1 = require("../data/mockData");
const inMemoryStore_1 = require("../data/inMemoryStore");
const quiz_service_1 = require("./quiz.service");
const DEFAULT_UI_SETTINGS = {
    largerText: false,
    showHints: true,
    stepByStepMode: false,
    reduceDistractions: false,
    showProgressFocus: true,
    showChallengeQuestions: false,
};
class StudentDashboardServiceError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'StudentDashboardServiceError';
    }
}
exports.StudentDashboardServiceError = StudentDashboardServiceError;
function getStudentDashboard(studentId) {
    if (!(0, quiz_service_1.isValidStudent)(studentId)) {
        throw new StudentDashboardServiceError(`Bilinmeyen öğrenci kimliği: ${studentId}`, 404);
    }
    const live = (0, inMemoryStore_1.getLastQuizResult)(studentId);
    const notifications = (0, inMemoryStore_1.getStudentNotifications)(studentId);
    return {
        studentId,
        studentName: (0, quiz_service_1.getStudentName)(studentId),
        lesson: live?.lesson ?? mockData_1.demoQuiz.lesson,
        topic: live?.topic ?? mockData_1.demoQuiz.topic,
        score: live?.score ?? 0,
        studentMessage: live?.studentMessage ?? 'Kişiselleştirilmiş öğrenme görünümü hazır.',
        uiSettings: live?.uiSettings ?? DEFAULT_UI_SETTINGS,
        notifications,
    };
}
//# sourceMappingURL=studentDashboard.service.js.map