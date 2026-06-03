'use server'

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// 1. API Lấy giá vàng Realtime
export async function getDomesticGoldPrice() {
  try {
    const response = await fetch('https://www.vang.today/api/prices?type=DOHCML', {
      next: { revalidate: 60 }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy giá vàng:', error);
    return null;
  }
}

// 2. Lấy danh sách giao dịch TỪ DATABASE
export async function getGoldTransactions() {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('session_user_id')?.value;
    if (!userIdStr) return [];

    const transactions = await prisma.goldTransaction.findMany({
      where: { userId: parseInt(userIdStr) },
      orderBy: { date: 'desc' } // Mới nhất lên đầu
    });
    return transactions;
  } catch (error) {
    console.error('Lỗi lấy dữ liệu giao dịch:', error);
    return [];
  }
}

// 3. Thêm giao dịch mới VÀO DATABASE
export async function addGoldTransaction(quantity: number, unit: string, buyPrice: number) {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('session_user_id')?.value;
    if (!userIdStr) return { error: 'Chưa đăng nhập' };

    await prisma.goldTransaction.create({
      data: {
        userId: parseInt(userIdStr),
        quantity,
        unit,
        buyPrice
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Lỗi thêm giao dịch:', error);
    return { error: 'Lỗi hệ thống' };
  }
}

// 4. Xóa giao dịch KHỎI DATABASE
export async function deleteGoldTransaction(id: number) {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('session_user_id')?.value;
    if (!userIdStr) return { error: 'Chưa đăng nhập' };

    await prisma.goldTransaction.delete({
      where: { 
        id: id,
        userId: parseInt(userIdStr) 
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Lỗi xóa giao dịch:', error);
    return { error: 'Lỗi hệ thống' };
  }
}