import env from "../config/env"
import { Role } from "../modules/users/user.interface"
import User from "../modules/users/user.model"
import bcrypt from 'bcrypt'

export const seedSuperAdmin = async () => {


    const ckAdmin = await User.findOne({ email: env.EMAIL_FROM })

    if (!ckAdmin) {

        await User.create({
            email: env.EMAIL_FROM,
            password: env.EMAIL_PASSWORD, // plain password
            fullName: 'Joseph Murray',
            role: Role.ADMIN,
            isVerified : true,
            auths: [
                {
                    provider: 'AuthProvider',
                    providerId: env.EMAIL_USER,
                },
            ],
        });
        console.log('Super Admin created Successfully!')
        return
    }

    console.log('Super Admin already created!')
}