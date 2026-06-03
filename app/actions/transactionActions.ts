'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Lấy danh sách giao dịch gần đây
export async function getRecentTransactions(userId: number = 1) {
  try {
    return await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 10, // Lấy 10 giao dịch gần nhất
      include: {
        account: true, // Lấy kèm thông tin tài khoản để hiển thị tên
      }
    });
  } catch (error) {
    console.error("Lỗi lấy giao dịch:", error);
    return [];
  }
}

// Thêm giao dịch và cập nhật số dư tài khoản
export async function createTransaction(formData: FormData) {
  const accountId = parseInt(formData.get('accountId') as string);
  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string; // 'income' hoặc 'expense'
  const notes = formData.get('notes') as string;
  const userId = 1;

  if (!accountId || isNaN(amount) || amount <= 0) return;

  try {
    // Dùng $transaction để đảm bảo 2 hành động xảy ra đồng thời.
    // Nếu 1 trong 2 lỗi, toàn bộ sẽ bị hủy để bảo vệ dữ liệu.
    await prisma.$transaction(async (tx) => {
      // 1. Ghi lại lịch sử giao dịch
      await tx.transaction.create({
        data: {
          userId,
          accountId,
          amount,
          type,
          notes,
          date: new Date(),
        }
      });

      // 2. Lấy số dư hiện tại và tính toán số dư mới
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (account) {
        const newBalance = type === 'income' 
          ? Number(account.balance) + amount 
          : Number(account.balance) - amount;

        // 3. Cập nhật lại số dư vào tài khoản
        await tx.account.update({
          where: { id: accountId },
          data: { balance: newBalance }
        });
      }
    });

    // Làm mới UI
    revalidatePath('/');
    
  } catch (error) {
    console.error("Lỗi khi ghi giao dịch:", error);
  }
}