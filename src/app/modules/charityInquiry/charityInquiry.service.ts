import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import prisma from "../../utils/prisma";
import type { InquiryStatus } from "@prisma/client";

const VALID_STATUSES: InquiryStatus[] = ["pending", "responded", "resolved", "archived"];

const isEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);

const createInquiry = async (payload: any) => {
  const { charityId, name, email, phone, subject, message } = payload || {};

  if (!charityId) throw new AppError(httpStatus.BAD_REQUEST, "charityId is required");
  if (!name?.trim()) throw new AppError(httpStatus.BAD_REQUEST, "Name is required");
  if (!email?.trim() || !isEmail(email))
    throw new AppError(httpStatus.BAD_REQUEST, "Valid email is required");
  if (!subject?.trim()) throw new AppError(httpStatus.BAD_REQUEST, "Subject is required");
  if (!message?.trim()) throw new AppError(httpStatus.BAD_REQUEST, "Message is required");

  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity) throw new AppError(httpStatus.NOT_FOUND, "Charity not found");

  return prisma.charityInquiry.create({
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

const getInquiries = async (
  pagination: { page: number; limit: number; skip: number; search: string },
  filters: { charityId?: string; status?: string }
) => {
  const { page, limit, skip, search } = pagination;

  const where: any = {};
  if (filters.charityId) where.charityId = filters.charityId;
  if (filters.status && VALID_STATUSES.includes(filters.status as InquiryStatus)) {
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

  const [data, total] = await prisma.$transaction([
    prisma.charityInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        charity: { select: { id: true, name: true, logo: true } },
      },
      skip,
      take: limit,
    }),
    prisma.charityInquiry.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getInquiryById = async (id: string) => {
  const inquiry = await prisma.charityInquiry.findUnique({
    where: { id },
    include: { charity: { select: { id: true, name: true, logo: true } } },
  });
  if (!inquiry) throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
  return inquiry;
};

const updateInquiryStatus = async (id: string, status: string) => {
  if (!VALID_STATUSES.includes(status as InquiryStatus)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status");
  }
  const existing = await prisma.charityInquiry.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
  return prisma.charityInquiry.update({
    where: { id },
    data: { status: status as InquiryStatus },
  });
};

const deleteInquiry = async (id: string) => {
  const existing = await prisma.charityInquiry.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
  return prisma.charityInquiry.delete({ where: { id } });
};

export const CharityInquiryService = {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
};
