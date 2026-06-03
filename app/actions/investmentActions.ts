'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Lấy danh mục đầu tư
export async function getInvestments(userId: number = 1) {
  try {
    return await prisma.investment.findMany({
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' }
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu đầu tư:", error);
    return [];
  }
}

// Thêm mới khoản đầu tư (Mua Vàng / Cổ phiếu)
export async function createInvestment(formData: FormData) {
  // 1. Ánh xạ dữ liệu từ Form vào đúng tên biến
  const symbolInput = formData.get('name') as string; // Form gửi 'name', DB nhận 'symbol'
  const newQuantity = Number(formData.get('quantity'));
  const newPrice = Number(formData.get('averageBuyPrice'));
  const currentPriceInput = formData.get('currentPrice');
  const currentPrice = currentPriceInput ? Number(currentPriceInput) : newPrice;
  const targetProfitPct = Number(formData.get('targetProfitPct')) || 0;
  
  const userId = 1;

  try {
    const existingAsset = await prisma.investment.findFirst({
      where: { userId, symbol: symbolInput } // Tìm theo symbol
    });

    if (existingAsset) {
      // 2. Ép kiểu Decimal của Prisma về Number trước khi làm toán DCA
      const oldQty = Number(existingAsset.quantity);
      const oldAvgPrice = Number(existingAsset.averageBuyPrice);

      const oldTotalCost = oldQty * oldAvgPrice;
      const newTotalCost = newQuantity * newPrice;
      
      const updatedQuantity = oldQty + newQuantity;
      const updatedAveragePrice = (oldTotalCost + newTotalCost) / updatedQuantity;

      await prisma.investment.update({
        where: { id: existingAsset.id },
        data: {
          quantity: updatedQuantity,
          averageBuyPrice: updatedAveragePrice,
          currentPrice: currentPrice,
          targetProfitPct: targetProfitPct > 0 ? targetProfitPct : Number(existingAsset.targetProfitPct || 0),
        }
      });
    } else {
      // 3. Khởi tạo mới hoàn toàn, truyền đủ các trường bắt buộc của Database bạn
      await prisma.investment.create({
        data: {
          userId,
          symbol: symbolInput, 
          assetType: 'ASSET', // Giá trị mặc định do DB của bạn yêu cầu trường này
          quantity: newQuantity,
          averageBuyPrice: newPrice,
          currentPrice,
          targetProfitPct,
          dividendReceived: 0 // Giá trị mặc định cho cổ tức
        }
      });
    }
  } catch (error) {
    console.error("Lỗi khi thêm/cập nhật tài sản:", error);
  }
}