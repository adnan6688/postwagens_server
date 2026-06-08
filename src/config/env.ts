import dotenv from 'dotenv';
dotenv.config();

interface EnvInterfaces {
  PORT: string;
  NODE_ENV?: 'development' | 'production';
  MONGO_URI?: string;


  REQUEST_RATE_LIMIT: number;
  REQUEST_RATE_LIMIT_TIME: number;

  REDIS_URL: string;


  JWT_ACCESS_SECRET: string;
  BCRYPT_SALT_ROUND: string;
  JWT_ACCESS_EXPIRATION?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_REFRESH_EXPIRATION?: string;

  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  OTP_JWT_ACCESS_SECRET: string;
  OTP_JWT_ACCESS_EXPIRATION: string;

  FRONTEND_URL: string;

  GOOGLE_OAUTH_ID: string;
  GOOGLE_OAUTH_SECRET: string;
  GOOGLE_CALLBACK_URL: string;

  APPLE_OAUTH_ID: string;
  APPLE_OAUTH_SECRET: string;
  APPLE_CALLBACK_URL: string;
  APPLE_TEAM_ID: string;
  APPLE_KEY_ID: string;

  CLOUDINARY_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_SECRET?: string;

  TYPE: string;
  PROJECT_ID: string;
  PRIVATE_KEY_ID: string;
  PRIVATE_KEY: string;
  CLIENT_EMAIL: string;
  CLIENT_ID: string;
  AUTH_URI: string;
  TOKEN_URI: string;
  AUTH_PROVIDER_X509_CERT_URL: string;
  CLIENT_X509_CERT_URL: string;
  UNIVERSE_DOMAIN: string;

}

const loadEnvVarbles = (): EnvInterfaces => {
  const requireEnvVariables: string[] = [
    'PORT',
    'NODE_ENV',
    'MONGO_URI',

    'REQUEST_RATE_LIMIT',
    'REQUEST_RATE_LIMIT_TIME',

    'REDIS_URL',


    'JWT_ACCESS_SECRET',
    'BCRYPT_SALT_ROUND',
    'JWT_ACCESS_EXPIRATION',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRATION',

    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_FROM',
    'EMAIL_FROM_NAME',

    'OTP_JWT_ACCESS_SECRET',
    'OTP_JWT_ACCESS_EXPIRATION',

    'FRONTEND_URL',

    'GOOGLE_OAUTH_ID',
    'GOOGLE_OAUTH_SECRET',
    'GOOGLE_CALLBACK_URL',

    'APPLE_OAUTH_ID',
    'APPLE_OAUTH_SECRET',
    'APPLE_CALLBACK_URL',
    'APPLE_TEAM_ID',
    'APPLE_KEY_ID',

    'CLOUDINARY_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_SECRET',

    'TYPE',
    'PROJECT_ID',
    'PRIVATE_KEY_ID',
    'PRIVATE_KEY',
    'CLIENT_EMAIL',
    'CLIENT_ID',
    'AUTH_URI',
    'TOKEN_URI',
    'AUTH_PROVIDER_X509_CERT_URL',
    'CLIENT_X509_CERT_URL',
    'UNIVERSE_DOMAIN',








  ];

  requireEnvVariables.forEach((KEY) => {
    if (!process.env[KEY]) {
      throw new Error(`Missing required env variable ${KEY}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    MONGO_URI: process.env.MONGO_URI as string,

    REQUEST_RATE_LIMIT_TIME: Number(
      process.env.REQUEST_RATE_LIMIT_TIME
    ) as number,
    REQUEST_RATE_LIMIT: Number(process.env.REQUEST_RATE_LIMIT) as number,

    REDIS_URL: process.env.REDIS_HOST as string,



    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string,
    EMAIL_USER: process.env.EMAIL_USER as string,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
    EMAIL_HOST: process.env.EMAIL_HOST as string,
    EMAIL_PORT: process.env.EMAIL_PORT as string,
    EMAIL_FROM: process.env.EMAIL_FROM as string,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME as string,
    OTP_JWT_ACCESS_SECRET: process.env.OTP_JWT_ACCESS_SECRET as string,
    OTP_JWT_ACCESS_EXPIRATION: process.env.OTP_JWT_ACCESS_EXPIRATION as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    GOOGLE_OAUTH_ID: process.env.GOOGLE_OAUTH_ID as string,
    GOOGLE_OAUTH_SECRET: process.env.GOOGLE_OAUTH_SECRET as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    APPLE_OAUTH_ID: process.env.APPLE_OAUTH_ID as string,
    APPLE_OAUTH_SECRET: process.env.APPLE_OAUTH_SECRET as string,
    APPLE_CALLBACK_URL: process.env.APPLE_CALLBACK_URL as string,
    APPLE_TEAM_ID: process.env.APPLE_TEAM_ID as string,
    APPLE_KEY_ID: process.env.APPLE_KEY_ID as string,
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET as string,

    TYPE: process.env.TYPE as string,
    PROJECT_ID: process.env.PROJECT_ID as string,
    PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID as string,
    PRIVATE_KEY: process.env.PRIVATE_KEY as string,
    CLIENT_EMAIL: process.env.CLIENT_EMAIL as string,
    CLIENT_ID: process.env.CLIENT_ID as string,
    AUTH_URI: process.env.AUTH_URI as string,
    TOKEN_URI: process.env.TOKEN_URI as string,
    AUTH_PROVIDER_X509_CERT_URL: process.env
      .AUTH_PROVIDER_X509_CERT_URL as string,
    CLIENT_X509_CERT_URL: process.env.CLIENT_X509_CERT_URL as string,
    UNIVERSE_DOMAIN: process.env.UNIVERSE_DOMAIN as string,

  };
};

export default loadEnvVarbles();