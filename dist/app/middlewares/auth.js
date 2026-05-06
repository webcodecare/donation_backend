"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth = (...roles) => {
    return (0, catchAsync_1.default)(async (req, _res, next) => {
        const bearerToken = req.headers.authorization;
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid or missing authorization header');
        }
        const token = bearerToken.split(' ')[1];
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You're not authorized to access this route");
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_token_secret);
        const { email } = decoded;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You're not authorized to access this route");
        }
        // if (roles.length && !roles.includes(user.role as string)) {
        //   throw new AppError(
        //     httpStatus.FORBIDDEN,
        //     "You don't have permission to access this route",
        //   );
        // }
        req.user = user;
        next();
    });
};
exports.default = auth;
