"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharityInquiryService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const VALID_STATUSES = ["pending", "responded", "resolved", "archived"];
const isEmail = (s) => /^\S+@\S+\.\S+$/.test(s);
const createInquiry = async (payload) => {
    const { charityId, name, email, phone, subject, message } = payload || {};
    if (!charityId)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "charityId is required");
    if (!name?.trim())
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Name is required");
    if (!email?.trim() || !isEmail(email))
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Valid email is required");
    if (!subject?.trim())
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Subject is required");
    if (!message?.trim())
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Message is required");
    const charity = await prisma_1.default.charity.findUnique({ where: { id: charityId } });
    if (!charity)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Charity not found");
    return prisma_1.default.charityInquiry.create({
        data: {
            charityId,
            name: name.trim(),
            email: email.trim(),
            phone: phone?.trim() || null,
            subject: subject.trim(),
            message: message.trim(),
        },
    });
};
const getInquiries = async (pagination, filters) => {
    const { page, limit, skip, search } = pagination;
    const where = {};
    if (filters.charityId)
        where.charityId = filters.charityId;
    if (filters.status && VALID_STATUSES.includes(filters.status)) {
        where.status = filters.status;
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { message: { contains: search, mode: "insensitive" } },
        ];
    }
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.charityInquiry.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                charity: { select: { id: true, name: true, logo: true } },
            },
            skip,
            take: limit,
        }),
        prisma_1.default.charityInquiry.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
const getInquiryById = async (id) => {
    const inquiry = await prisma_1.default.charityInquiry.findUnique({
        where: { id },
        include: { charity: { select: { id: true, name: true, logo: true } } },
    });
    if (!inquiry)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Inquiry not found");
    return inquiry;
};
const updateInquiryStatus = async (id, status) => {
    if (!VALID_STATUSES.includes(status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid status");
    }
    const existing = await prisma_1.default.charityInquiry.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Inquiry not found");
    return prisma_1.default.charityInquiry.update({
        where: { id },
        data: { status: status },
    });
};
const deleteInquiry = async (id) => {
    const existing = await prisma_1.default.charityInquiry.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Inquiry not found");
    return prisma_1.default.charityInquiry.delete({ where: { id } });
};
exports.CharityInquiryService = {
    createInquiry,
    getInquiries,
    getInquiryById,
    updateInquiryStatus,
    deleteInquiry,
};
