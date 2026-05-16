"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
function globalErrorHandler(error, _req, res, _next) {
    console.error('[NeuroAdapt Error]', error.message);
    res.status(500).json({
        error: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
    });
}
//# sourceMappingURL=errorHandler.js.map