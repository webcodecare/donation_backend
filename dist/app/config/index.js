"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    client_url: process.env.CLIENT_URL,
    jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    jwt_access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    jwt_refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_publish_key: process.env.PUBLISH_KEY,
    cloudinary: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    },
};
