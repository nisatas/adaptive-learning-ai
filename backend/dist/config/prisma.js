"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
const client_1 = require("@prisma/client");
let prisma;
function getPrismaClient() {
    if (!process.env.DATABASE_URL) {
        return null;
    }
    if (!prisma) {
        prisma = new client_1.PrismaClient();
    }
    return prisma;
}
//# sourceMappingURL=prisma.js.map