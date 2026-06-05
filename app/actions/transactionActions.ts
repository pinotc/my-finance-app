'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getRecentTransactions(userId: number = 1) {
  try {
    return await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 10,
      include: {
        account: true,
        category: true,
      }
    });
  } catch (error) {
    console.error("Lỗi lấy giao dịch:", error);
    return [];
  }
}

export async function createTransaction(formData: FormData) {
  const accountId = parseInt(formData.get('accountId') as string);
  const toAccountId = formData.get('toAccountId') ? parseInt(formData.get('toAccountId') as string) : null;
  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string; // 'income', 'expense', 'transfer'
  const notes = formData.get('notes') as string;
  const categoryName = formData.get('categoryName') as string; 
  const userId = 1;

  if (!accountId || isNaN(amount) || amount <= 0) return;

  try {
    await prisma.$transaction(async (tx) => {
      // LẤY THÔNG TIN TÀI KHOẢN NGUỒN ĐỂ KIỂM TRA SỐ DƯ
      const sourceAccount = await tx.account.findUnique({ where: { id: accountId } });
      if (!sourceAccount) throw new Error("Tài khoản nguồn không tồn tại");

      // CHẶN TIỀN ÂM: Nếu là Chi tiền hoặc Chuyển khoản mà số dư không đủ thì dừng lại luôn
      if ((type === 'expense' || type === 'transfer') && Number(sourceAccount.balance) < amount) {
        throw new Error("Số dư tài khoản không đủ để thực hiện giao dịch này!");
      }

      let finalCategoryId = null;

      // XỬ LÝ THEO LOẠI GIAO DỊCH
      if (type === 'transfer') {
        // LUỒNG CHUYỂN KHOẢN
        if (!toAccountId || accountId === toAccountId) throw new Error("Tài khoản nhận không hợp lệ");

        const targetAccount = await tx.account.findUnique({ where: { id: toAccountId } });
        if (!targetAccount) throw new Error("Tài khoản nhận không tồn tại");

        // Trừ tiền tài khoản nguồn
        await tx.account.update({
          where: { id: accountId },
          data: { balance: Number(sourceAccount.balance) - amount }
        });

        // Cộng tiền tài khoản nhận
        await tx.account.update({
          where: { id: toAccountId },
          data: { balance: Number(targetAccount.balance) + amount }
        });

      } else {
        // LUỒNG THU / CHI THÔNG THƯỜNG (Find or Create Category)
        if (categoryName) {
          let category = await tx.category.findFirst({
            where: { name: categoryName, type: type }
          });

          if (!category) {
            category = await tx.category.create({
              data: { name: categoryName, type: type, userId }
            });
          }
          finalCategoryId = category.id;
        }

        // Cập nhật số dư tài khoản thông thường
        const newBalance = type === 'income' 
          ? Number(sourceAccount.balance) + amount 
          : Number(sourceAccount.balance) - amount;

        await tx.account.update({
          where: { id: accountId },
          data: { balance: newBalance }
        });
      }

      // GHI NHẬT KÝ GIAO DỊCH VÀO DATABASE
      await tx.transaction.create({
        data: {
          userId,
          accountId,
          toAccountId: type === 'transfer' ? toAccountId : null,
          amount,
          type,
          notes,
          categoryId: finalCategoryId,
          date: new Date(),
        }
      });
    });

    revalidatePath('/');
    revalidatePath('/reports');
    revalidatePath('/budgets');
  } catch (error: any) {
    console.error("Lỗi hệ thống giao dịch:", error.message);
  }
}