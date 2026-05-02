import prisma from '../../utils/prisma';

const GetAllUsers = async () => {
  const result = await prisma.user.findMany({});
  return result;
};

const GetSingleUser = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return result;
};

const DeleteUser = async (id: string) => {
  await prisma.user.delete({
    where: {
      id: id,
    },
  });
};

export const UserService = {
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
};
