'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Lấy danh sách ngân sách và tính toán số tiền đã chi
export async function getBudgets(userId: number = 1) {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true }
    });

    // Lấy ngày đầu tháng và cuối tháng hiện tại
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Tính toán số tiền đã sử dụng cho từng ngân sách
    const budgetsWithUsage = await Promise.all(budgets.map(async (budget) => {
      const transactions = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'expense',
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      const spent = Number(transactions._sum.amount || 0);
      return {
        ...budget,
        spent,
        remaining: Number(budget.amount) - spent,
        percent: Math.min(Math.round((spent / Number(budget.amount)) * 100), 100)
      };
    }));

    return budgetsWithUsage;
  } catch (error) {
    console.error("Lỗi lấy ngân sách:", error);
    return [];
  }
}

// 2. Tạo ngân sách mới (Tự động tạo danh mục nếu chưa có)
export async function createBudget(formData: FormData) {
  const categoryName = formData.get('categoryName') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const userId = 1;

  if (!categoryName || isNaN(amount) || amount <= 0) return;

  try {
    // Tìm hoặc tạo danh mục
    let category = await prisma.category.findFirst({
      where: { name: categoryName, userId }
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName, type: 'expense', userId }
      });
    }

    // Tạo thiết lập ngân sách tháng
    const now = new Date();
    await prisma.budget.create({
      data: {
        userId,
        categoryId: category.id,
        amount,
        period: 'monthly',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      }
    });

    revalidatePath('/budgets');
  } catch (error) {
    console.error("Lỗi tạo ngân sách:", error);
  }
}