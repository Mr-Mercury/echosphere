import { getSession } from "@auth/express";
const AuthConfig = {
    secret: process.env.AUTH_SECRET,
    providers: [],
};
export async function authenticatedUser(req, res, next) {
    const session = res.locals.session ?? (await getSession(req, AuthConfig));
    if (!session?.user) {
        res.redirect("/login");
    }
    else {
        next();
    }
}
//# sourceMappingURL=message-auth.js.map