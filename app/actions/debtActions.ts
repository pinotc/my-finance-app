'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Lấy danh sách các khoản nợ và thẻ tín dụng
export async function getDebts(userId: number = 1) {
  try {
    return await prisma.debt.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' }
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách nợ:", error);
    return [];
  }
}

// 2. Thêm một khoản nợ hoặc thẻ tín dụng mới
export async function createDebt(formData: FormData) {
  const type = formData.get('type') as string; // 'loan' (đi vay) hoặc 'credit_card' (thẻ tín dụng)
  const lender = formData.get('lender') as string; // Tên ngân hàng / Chủ nợ
  const totalAmount = parseFloat(formData.get('totalAmount') as string); // Gốc vay hoặc Hạn mức thẻ
  const remainingDebt = parseFloat(formData.get('remainingDebt') as string); // Dư nợ hiện tại
  const interestRate = parseFloat(formData.get('interestRate') as string) || 0;
  const dueDateStr = formData.get('dueDate') as string;
  const userId = 1;

  if (!lender || isNaN(totalAmount) || isNaN(remainingDebt)) return;

  try {
    await prisma.debt.create({
      data: {
        userId,
        type,
        lender,
        totalAmount,
        remainingDebt,
        interestRate,
        dueDate: dueDateStr ? new Date(dueDateStr) : null
      }
    });

    revalidatePath('/debts');
  } catch (error) {
    console.error("Lỗi tạo khoản nợ:", error);
  }
}