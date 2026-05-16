"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const runtimeDiagnostics_1 = require("./utils/runtimeDiagnostics");
const app = (0, app_1.createApp)();
app.listen(env_1.env.port, () => {
    (0, runtimeDiagnostics_1.logStartupDiagnostics)();
    console.log(`NeuroAdapt backend running on http://localhost:${env_1.env.port}`);
});
//# sourceMappingURL=server.js.map