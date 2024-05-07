import { db } from '@/lib/db/db';
import { v4 as uuidv4 } from 'uuid'
import { getVerificationTokenByEmail } from './verify-token';


export const generateVerificationToken = async ( email: string) => {
    const token = uuidv4();
    //1 hr expiration
    const expires = new Date(new Date().getTime() + 3600  * 1000);

    const tokenExists = await getVerificationTokenByEmail(email);

    if (tokenExists) {
        await db.verificationToken.delete({
            where: {
                id: tokenExists.id
            }
        })
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            email, token, expires,
        }
    })

    return verificationToken;
}