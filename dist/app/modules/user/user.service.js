"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const GetAllUsers = async (pagination) => {
    const { page, limit, skip, search } = pagination;
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ];
    }
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
            skip,
            take: limit,
        }),
        prisma_1.default.user.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
const GetSingleUser = async (id) => {
    return prisma_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
const DeleteUser = async (id) => {
    await prisma_1.default.user.delete({ where: { id } });
};
exports.UserService = {
    GetAllUsers,
    GetSingleUser,
    DeleteUser,
};
