'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Lấy danh sách mục tiêu tài chính
export async function getGoals(userId: number = 1) {
  try {
    return await prisma.financialGoal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' }
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách mục tiêu:", error);
    return [];
  }
}

// 2. Tạo mục tiêu tài chính mới
export async function createGoal(formData: FormData) {
  const name = formData.get('name') as string;
  const targetAmount = parseFloat(formData.get('targetAmount') as string);
  const currentAmount = parseFloat(formData.get('currentAmount') as string) || 0;
  const deadlineStr = formData.get('deadline') as string;
  const userId = 1;

  if (!name || isNaN(targetAmount) || targetAmount <= 0) return;

  try {
    await prisma.financialGoal.create({
      data: {
        userId,
        name,
        targetAmount,
        currentAmount,
        deadline: deadlineStr ? new Date(deadlineStr) : null
      }
    });

    revalidatePath('/goals');
  } catch (error) {
    console.error("Lỗi tạo mục tiêu tài chính:", error);
  }
}

// 3. Nộp thêm tiền tích lũy vào mục tiêu
export async function fundGoal(formData: FormData) {
  const goalId = parseInt(formData.get('goalId') as string);
  const amount = parseFloat(formData.get('amount') as string);

  if (isNaN(goalId) || isNaN(amount) || amount <= 0) return;

  try {
    const goal = await prisma.financialGoal.findUnique({ where: { id: goalId } });
    if (!goal) return;

    await prisma.financialGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: Number(goal.currentAmount) + amount
      }
    });

    revalidatePath('/goals');
  } catch (error) {
    console.error("Lỗi tích lũy mục tiêu:", error);
  }
}