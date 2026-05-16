"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
function getHealth(_req, res) {
    const payload = {
        status: 'ok',
        message: 'NeuroAdapt backend is running',
    };
    res.json(payload);
}
//# sourceMappingURL=health.controller.js.map