"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedUser = void 0;
const express_1 = require("@auth/express");
async function authenticatedUser(req, res, next) {
    const session = res.locals.session ?? (await (0, express_1.getSession)(req, AuthConfig));
    if (!session?.user) {
        res.redirect("/login");
    }
    else {
        next();
    }
}
exports.authenticatedUser = authenticatedUser;
