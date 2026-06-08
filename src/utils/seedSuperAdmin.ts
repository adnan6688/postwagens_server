import env from "../config/env"
import { Role } from "../modules/users/user.interface"
import User from "../modules/users/user.model"


export const seedSuperAdmin = async () => {


    const ckAdmin = await User.findOne({ email: env.EMAIL_USER })
    if (!ckAdmin) {
    
        await User.create({
            email: env.EMAIL_USER,
            password: env.EMAIL_PASSWORD, // plain password
            fullName: 'Golam Faruk Adnna',
            role: Role.ADMIN,
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