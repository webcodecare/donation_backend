import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin@gmail.com', 10);

      await prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          emailVerified: true,
          isActive: true,
        },
      });

      console.log('✅ Default admin created');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
};
