'use server'

import { prisma } from '@/lib/prisma';

export async function getDashboardStats(userId: number = 1) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Tính tổng Thu và tổng Chi của tháng hiện tại
    const txStats = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    txStats.forEach(stat => {
      if (stat.type === 'income') monthlyIncome = Number(stat._sum.amount || 0);
      if (stat.type === 'expense') monthlyExpense = Number(stat._sum.amount || 0);
    });

    // 2. Thống kê chi tiêu gom nhóm theo danh mục (Categories) để làm biểu đồ cơ cấu
    const categoryStats = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'expense',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true },
    });

    // Lấy tên cụ thể của từng danh mục
    const categoryBreakdown = await Promise.all(categoryStats.map(async (stat) => {
      if (!stat.categoryId) return { name: 'Khác', amount: Number(stat._sum.amount || 0) };
      const cat = await prisma.category.findUnique({ where: { id: stat.categoryId } });
      return {
        name: cat?.name || 'Khác',
        amount: Number(stat._sum.amount || 0)
      };
    }));

    return {
      monthlyIncome,
      monthlyExpense,
      categoryBreakdown: categoryBreakdown.sort((a, b) => b.amount - a.amount) // Sắp xếp chi nhiều nhất lên trước
    };
  } catch (error) {
    console.error("Lỗi lấy số liệu báo cáo:", error);
    return { monthlyIncome: 0, monthlyExpense: 0, categoryBreakdown: [] };
  }
}