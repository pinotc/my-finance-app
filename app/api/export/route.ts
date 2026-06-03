import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Truy vấn toàn bộ giao dịch của hệ thống kèm tên tài khoản
    const transactions = await prisma.transaction.findMany({
      where: { userId: 1 },
      include: { account: true },
      orderBy: { date: 'desc' }
    });

    // 2. Định nghĩa cấu trúc file CSV
    // Thêm ký tự \uFEFF (BOM) ở đầu để Excel hiểu đây là UTF-8, không bị lỗi font tiếng Việt
    let csvContent = '\uFEFF'; 
    csvContent += 'Mã giao dịch,Ngày tháng,Tài khoản ngân hàng,Phân loại,Số tiền (VND),Ghi chú diễn giải\n';

    // 3. Duyệt dữ liệu điền vào các hàng
    transactions.forEach((tx) => {
      const dateStr = new Date(tx.date).toLocaleDateString('vi-VN');
      const typeStr = tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu';
      
      // Khử tất cả dấu phẩy trong phần ghi chú để không làm lệch cột của file CSV
      const notesStr = tx.notes ? tx.notes.replace(/,/g, ' ') : 'Không có ghi chú';
      
      csvContent += `${tx.id},${dateStr},${tx.account.name},${typeStr},${tx.amount},${notesStr}\n`;
    });

    // 4. Trả về phản hồi dưới dạng file download dữ liệu sạch
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=Bao_Cao_Tai_Chinh_Giao_Dich.csv',
      },
    });

  } catch (error) {
    console.error('Lỗi xuất file dữ liệu:', error);
    return NextResponse.json({ error: 'Không thể xuất dữ liệu lúc này' }, { status: 500 });
  }
}