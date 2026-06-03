'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Hàm helper hỗ trợ tự động lấy và kiểm tra ID người dùng từ Session Cookie
async function getLoggedInUserId() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get('session_user_id')?.value;
  if (!userIdStr) return null;
  
  const parsedId = parseInt(userIdStr);
  return isNaN(parsedId) ? null : parsedId;
}

// ==========================================
// THAO TÁC TÀI KHOẢN (ACCOUNTS)
// ==========================================

// Lấy danh sách tài khoản từ Database dựa theo User đang đăng nhập
export async function getAccounts() {
  try {
    const userId = await getLoggedInUserId();
    if (!userId) return []; // Trả về mảng rỗng nếu chưa đăng nhập hợp lệ

    const accounts = await prisma.account.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });
    return accounts;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu tài khoản:", error);
    return [];
  }
}

// Thêm tài khoản mới vào Database gắn liền với User ID đang đăng nhập
export async function createAccount(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const balance = parseFloat(formData.get('balance') as string);
  
  try {
    const userId = await getLoggedInUserId();
    if (!userId) {
      console.error("Từ chối thao tác: Người dùng chưa đăng nhập.");
      return;
    }

    // Lưu tài khoản mới chính xác theo chủ sở hữu
    await prisma.account.create({
      data: {
        userId,
        name,
        type,
        balance,
      }
    });

    // Yêu cầu Next.js làm mới dữ liệu trang chủ ngay lập tức
    revalidatePath('/');
    
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản:", error);
  }
}

// ==========================================
// QUẢN LÝ TÀI KHOẢN & BẢO MẬT (AUTH & PROFILE)
// ==========================================

// ĐĂNG KÝ TÀI KHOẢN MỚI
export async function register(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password || !name) {
    return { error: 'Vui lòng điền đầy đủ tất cả các trường.' };
  }

  try {
    const existingUser = await prisma.user.findFirst({ where: { username } });
    if (existingUser) {
      return { error: 'Tên người dùng này đã được sử dụng.' };
    }

    // Tạo tài khoản mới trong Database
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash: password, 
      }
    });

    // Tự động thiết lập session đăng nhập ngay sau khi đăng ký thành công
    const cookieStore = await cookies();
    cookieStore.set('session_user_id', newUser.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // Hạn dùng 1 ngày
      path: '/',
    });
  } catch (error) {
    console.error('Lỗi đăng ký tài khoản:', error);
    return { error: 'Có lỗi xảy ra trong quá trình tạo tài khoản.' };
  }
  redirect('/');
}

// CẬP NHẬT HỌ TÊN HIỂN THỊ
export async function updateProfile(formData: FormData) {
  const name = formData.get('name') as string;
  
  try {
    const userId = await getLoggedInUserId();
    if (!userId) redirect('/login');

    await prisma.user.update({
      where: { id: userId },
      data: { name }
    });
  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error);
  }
  redirect('/settings'); // Làm mới giao diện thiết lập
}

// ĐỔI MẬT KHẨU TÀI KHOẢN
export async function changePassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'Mật khẩu mới nhập lại không khớp.' };
  }

  try {
    const userId = await getLoggedInUserId();
    if (!userId) redirect('/login');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.passwordHash !== currentPassword) {
      return { error: 'Mật khẩu hiện tại không chính xác.' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPassword }
    });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return { error: 'Hệ thống bận, vui lòng thử lại sau.' };
  }
  redirect('/settings?status=success');
}

// ĐẶT LẠI MẬT KHẨU (FORGOT PASSWORD)
export async function resetPassword(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'Mật khẩu mới nhập lại không khớp.' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return { error: 'Không tìm thấy tài khoản nào sử dụng Tên người dùng này.' };
    }

    // Cập nhật mật khẩu mới vào Database
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPassword }
    });

  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    return { error: 'Có lỗi hệ thống xảy ra, vui lòng thử lại.' };
  }
  
  // Thành công thì chuyển về trang đăng nhập kèm cờ thông báo
  redirect('/login?reset=success');
}