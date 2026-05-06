"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_utils_1 = __importDefault(require("./auth.utils"));
const config_1 = __importDefault(require("../../config"));
const Login = async (payload) => {
    const user = await prisma_1.default.user.findFirst({
        where: { email: payload.email },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No user found with this email');
    }
    const isPasswordMatched = await await bcrypt_1.default.compare(payload.password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid email or password');
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const access_token = auth_utils_1.default.CreateToken(jwtPayload, config_1.default.jwt_access_token_secret, config_1.default.jwt_access_token_expires_in);
    const refresh_token = auth_utils_1.default.CreateToken(jwtPayload, config_1.default.jwt_refresh_token_secret, config_1.default.jwt_refresh_token_expires_in);
    return { access_token, refresh_token };
};
const Register = async (payload) => {
    const isUserExists = await prisma_1.default.user.findFirst({
        where: { email: payload.email },
    });
    if (isUserExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists');
    }
    const hashedPassword = await bcrypt_1.default.hash(payload.password, Number(config_1.default.bcrypt_salt_rounds));
    const user = await prisma_1.default.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
        },
    });
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const access_token = auth_utils_1.default.CreateToken(jwtPayload, config_1.default.jwt_access_token_secret, config_1.default.jwt_access_token_expires_in);
    const refresh_token = auth_utils_1.default.CreateToken(jwtPayload, config_1.default.jwt_refresh_token_secret, config_1.default.jwt_refresh_token_expires_in);
    return { access_token, refresh_token };
};
const ChangePassword = async (payload, user) => {
    const isUserValid = await prisma_1.default.user.findFirst({
        where: { id: user.id },
    });
    if (!isUserValid) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No user found');
    }
    const isPasswordMatched = await bcrypt_1.default.compare(payload.old_password, isUserValid.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid password');
    }
    const hashedPassword = await bcrypt_1.default.hash(payload.new_password, Number(config_1.default.bcrypt_salt_rounds));
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
};
const AuthService = {
    Login,
    Register,
    ChangePassword,
};
exports.default = AuthService;
