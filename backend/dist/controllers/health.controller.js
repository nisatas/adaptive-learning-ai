"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
exports.getIntegrationsHealth = getIntegrationsHealth;
const runtimeDiagnostics_1 = require("../utils/runtimeDiagnostics");
function getHealth(_req, res) {
    const payload = {
        status: 'ok',
        message: 'NeuroAdapt backend is running',
    };
    res.json(payload);
}
function getIntegrationsHealth(_req, res) {
    res.json((0, runtimeDiagnostics_1.buildIntegrationsHealth)());
}
//# sourceMappingURL=health.controller.js.map