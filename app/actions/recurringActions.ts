'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Lấy danh sách hóa đơn định kỳ
export async function getRecurringTransactions(userId: number = 1) {
  try {
    return await prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: { nextDate: 'asc' },
      include: { account: true }
    });
  } catch (error) {
    console.error("Lỗi lấy hóa đơn định kỳ:", error);
    return [];
  }
}

// 2. Thiết lập một lịch trình hóa đơn/thu nhập định kỳ mới
export async function createRecurring(formData: FormData) {
  const name = formData.get('name') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string; // 'income' hoặc 'expense'
  const frequency = formData.get('frequency') as string; // 'monthly', 'yearly', 'weekly'
  const accountId = parseInt(formData.get('accountId') as string);
  const nextDateStr = formData.get('nextDate') as string;
  const userId = 1;

  if (!name || isNaN(amount) || !accountId || !nextDateStr) return;

  try {
    await prisma.recurringTransaction.create({
      data: {
        userId,
        accountId,
        name,
        amount,
        type,
        frequency,
        nextDate: new Date(nextDateStr),
        status: 'active'
      }
    });

    revalidatePath('/recurring');
  } catch (error) {
    console.error("Lỗi tạo hóa đơn định kỳ:", error);
  }
}