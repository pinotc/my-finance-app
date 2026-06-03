import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Đọc chuỗi kết nối từ file .env
const connectionString = process.env.DATABASE_URL;

// Ngăn Next.js tạo quá nhiều kết nối database khi Hot Reload trong lúc dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Khởi tạo connection pool với adapter pg (bắt buộc cho Prisma 7)
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Export biến prisma để dùng chung ở các file khác
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;