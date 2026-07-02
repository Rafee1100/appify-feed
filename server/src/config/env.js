import { config as loadDotEnv } from 'dotenv';

if(process.env.NODE_ENV !== 'production') {
    loadDotEnv();
}
if(process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required in production');
    process.exit(1);
}

export const env = process.env;