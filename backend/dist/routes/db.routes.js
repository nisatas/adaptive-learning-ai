"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_controller_1 = require("../controllers/db.controller");
const router = (0, express_1.Router)();
router.get('/status', db_controller_1.getDbStatus);
exports.default = router;
//# sourceMappingURL=db.routes.js.map