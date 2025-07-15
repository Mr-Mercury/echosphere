import { db } from "@/lib/db/db";
export const getVerificationTokenByEmail = async (email) => {
    try {
        const verificationToken = await db.verificationToken.findFirst({
            where: { email }
        });
        return verificationToken;
    }
    catch {
        return null;
    }
};
export const getVerificationTokenByToken = async (token) => {
    try {
        const verificationToken = await db.verificationToken.findUnique({
            where: { token }
        });
        return verificationToken;
    }
    catch {
        return null;
    }
};
//# sourceMappingURL=verify-token.js.map