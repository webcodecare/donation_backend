"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt_1.default.hash('admin@gmail.com', 10);
            await prisma.user.create({
                data: {
                    name: 'Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    role: client_1.Role.ADMIN,
                },
            });
            console.log('✅ Default admin created');
        }
        else {
            console.log('ℹ️ Admin already exists');
        }
    }
    catch (error) {
        console.error('❌ Seed error:', error);
    }
};
exports.seedAdmin = seedAdmin;
