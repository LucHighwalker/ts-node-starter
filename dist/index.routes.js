"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const auth_routes_1 = require("./auth/auth.routes");
class Routes {
    constructor() {
        this.express = express();
        this.mountRoutes();
    }
    mountRoutes() {
        const auth = new auth_routes_1.default().router;
        this.express.use('/auth', auth);
    }
}
exports.default = new Routes().express;
//# sourceMappingURL=index.routes.js.map