"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbStatus = getDbStatus;
const persistence_service_1 = require("../services/persistence.service");
async function getDbStatus(_req, res) {
    const connected = await (0, persistence_service_1.isDatabaseAvailable)();
    if (connected) {
        res.json({
            database: 'MySQL',
            orm: 'Prisma',
            connected: true,
            message: 'Database connection is available',
        });
        return;
    }
    res.json({
        database: 'MySQL',
        orm: 'Prisma',
        connected: false,
        message: 'Database connection is not available. In-memory fallback is active.',
    });
}
//# sourceMappingURL=db.controller.js.map