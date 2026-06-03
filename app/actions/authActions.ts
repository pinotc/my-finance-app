'use server'

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ==========================================
// 1. ĐĂNG NHẬP
// ==========================================
export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  let isSuccess = false;

  try {
    const user = await prisma.user.findFirst({ where: { username } });
    
    if (!user || user.passwordHash !== password) {
      return { error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
    }

    const cookieStore = await cookies();
    cookieStore.set('session_user_id', user.id.toString(), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24, path: '/',
    });
    isSuccess = true;
  } catch (error) {
    console.error('======= LỖI ĐĂNG NHẬP =======\n', error);
    return { error: 'Đã xảy ra lỗi hệ thống khi đăng nhập.' };
  }
  
  if (isSuccess) redirect('/');
}

// ==========================================
// 2. ĐĂNG KÝ
// ==========================================
export async function register(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  let isSuccess = false;

  if (!username || !password || !name) {
    return { error: 'Vui lòng điền đầy đủ tất cả các trường.' };
  }

  try {
    const existingUser = await prisma.user.findFirst({ where: { username } });
    if (existingUser) {
      return { error: 'Tên đăng nhập này đã được sử dụng.' };
    }

    // Chỉ tạo user mới, không tự động set Cookie đăng nhập nữa
    await prisma.user.create({
      data: {
        name,
        username,
        passwordHash: password,
      }
    });

    isSuccess = true;
  } catch (error: any) {
    console.error('======= LỖI ĐĂNG KÝ =======\n', error);
    return { error: `Lỗi cấu trúc Database: ${error.message || 'Không thể ghi dữ liệu'}` };
  }
  
  // Đẩy về trang Login kèm cờ báo thành công
  if (isSuccess) redirect('/login?register=success');
}

// ==========================================
// 3. QUÊN MẬT KHẨU
// ==========================================


// 4. LẤY PHIÊN ĐĂNG NHẬP
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('session_user_id')?.value;
    if (!userIdStr) return null;
    const parsedId = parseInt(userIdStr);
    if (isNaN(parsedId)) return null;

    return await prisma.user.findUnique({ where: { id: parsedId } });
  } catch (error) {
    return null;
  }
}

// 5. ĐĂNG XUẤT
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session_user_id');
  redirect('/login');
}

// 6. CẬP NHẬT TÊN HIỂN THỊ
export async function updateProfile(formData: FormData) {
  const name = formData.get('name') as string;
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get('session_user_id')?.value;
  if (!userIdStr) redirect('/login');

  try {
    await prisma.user.update({
      where: { id: parseInt(userIdStr) },
      data: { name }
    });
  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error);
  }
  redirect('/settings'); 
}

// 7. ĐỔI MẬT KHẨU TRONG TRANG CÀI ĐẶT
export async function changePassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) redirect('/settings?error=mismatch');

  const cookieStore = await cookies();
  const userIdStr = cookieStore.get('session_user_id')?.value;
  if (!userIdStr) redirect('/login');

  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
    if (!user || user.passwordHash !== currentPassword) redirect('/settings?error=incorrect');

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPassword }
    });
  } catch (error) {
    redirect('/settings?error=system');
  }
  redirect('/settings?status=success');
}