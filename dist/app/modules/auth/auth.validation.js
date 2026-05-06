"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const LoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
            .email('Invalid email format'),
        password: zod_1.z.string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        }),
    }),
});
const RegisterSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({
            required_error: 'lastName is required',
            invalid_type_error: 'Full name must be a string',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
            .email('Email must be a valid email'),
        password: zod_1.z
            .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
            .min(6, 'Password must be at least 6 characters'),
        role: zod_1.z
            .enum(['JOB_SEEKER', 'RECRUITER', 'ADMIN'], {
            invalid_type_error: 'Role must be either JOB_SEEKER, RECRUITER, or ADMIN',
            message: 'Role is required and must be either JOB_SEEKER, RECRUITER, or ADMIN',
        })
            .default('JOB_SEEKER'),
    }),
});
const ChangePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        old_password: zod_1.z.string({
            required_error: 'Old password is required',
            invalid_type_error: 'Old password must be a string',
        }),
        new_password: zod_1.z.string({
            required_error: 'New password is required',
            invalid_type_error: 'New password must be a string',
        }),
    }),
});
const AuthValidation = { LoginSchema, RegisterSchema, ChangePasswordSchema };
exports.default = AuthValidation;
