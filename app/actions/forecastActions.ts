'use server'

import { prisma } from '@/lib/prisma';

export async function getCashFlowForecast(userId: number = 1) {
  try {
    // 1. Lấy tổng số dư hiện tại làm điểm xuất phát
    const accounts = await prisma.account.findMany({ where: { userId } });
    const currentBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // 2. Lấy các giao dịch định kỳ đang hoạt động
    const recurring = await prisma.recurringTransaction.findMany({ 
      where: { userId, status: 'active' } 
    });

    const projections = [];
    let simulatedBalance = currentBalance;
    const now = new Date();

    // 3. Chạy giả lập cho 3 tháng tiếp theo
    for (let i = 1; i <= 3; i++) {
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      recurring.forEach((rt: any) => {
        // Ước tính đơn giản: nếu là hàng tháng thì cộng/trừ trực tiếp
        if (rt.frequency === 'monthly') {
          if (rt.type === 'income') monthlyIncome += Number(rt.amount);
          if (rt.type === 'expense') monthlyExpense += Number(rt.amount);
        }
        // Có thể mở rộng logic tính cho weekly/yearly ở đây sau
      });

      simulatedBalance = simulatedBalance + monthlyIncome - monthlyExpense;
      
      const targetMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
      
      projections.push({
        id: i,
        monthLabel: targetMonth.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
        expectedIncome: monthlyIncome,
        expectedExpense: monthlyExpense,
        projectedBalance: simulatedBalance,
        isWarning: simulatedBalance < 0 // Cảnh báo nếu dự báo số dư âm
      });
    }

    return { currentBalance, projections };
  } catch (error) {
    console.error("Lỗi tính toán dự báo:", error);
    return { currentBalance: 0, projections: [] };
  }
}