import prisma from '../../utils/prisma';

const GetAllUsers = async (
  pagination: { page: number; limit: number; skip: number; search: string }
) => {
  const { page, limit, skip, search } = pagination;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
      { phone: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
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
    prisma.user.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const GetSingleUser = async (id: string) => {
  return prisma.user.findUnique({
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

const DeleteUser = async (id: string) => {
  await prisma.user.delete({ where: { id } });
};

export const UserService = {
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
};
