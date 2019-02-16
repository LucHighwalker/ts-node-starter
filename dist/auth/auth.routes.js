"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const auth_controller_1 = require("./auth.controller");
class Auth {
    constructor() {
        const controller = new auth_controller_1.default();
        this.router = express.Router();
        this.router.route('/');
        this.router.get('/', (req, res) => {
            const response = controller.testResponse();
            res.json({
                response
            });
        });
    }
}
exports.default = Auth;
//# sourceMappingURL=auth.routes.js.map