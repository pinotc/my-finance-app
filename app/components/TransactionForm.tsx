"use client";
import { useState } from 'react';

export const EXPENSE_CATEGORIES = [
  "Tiền trọ / Nhà", "Ăn uống", "Xăng xe / Đi lại", "Mua sắm",
  "Điện / Nước / Net / ĐT", "Sức khỏe, Làm đẹp", "Hiếu hỉ", "Khác"
];

export const INCOME_CATEGORIES = [
  "Tiền lương", "Được cho tặng", "Freelancer"
];

export default function TransactionForm({ accounts, createTransaction }: { accounts: any[], createTransaction: any }) {
  const [type, setType] = useState('expense');
  const [selectedSource, setSelectedSource] = useState('');

  return (
    <form action={createTransaction} className="space-y-4">
      {/* Tài khoản nguồn */}
      <div>
        <label className="block text-sm text-slate-500 mb-1.5 font-medium">Tài khoản nguồn</label>
        <select 
          name="accountId" 
          required 
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium"
        >
          <option value="">-- Chọn tài khoản --</option>
          {accounts.map((acc: any) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({new Intl.NumberFormat('vi-VN').format(acc.balance)} đ)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Loại Giao dịch */}
        <div>
          <label className="block text-sm text-slate-500 mb-1.5 font-medium">Loại hình</label>
          <select 
            name="type" 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium"
          >
            <option value="expense">Chi tiền ↓</option>
            <option value="income">Thu tiền ↑</option>
            <option value="transfer">Chuyển khoản ⇄</option>
          </select>
        </div>

        {/* Hiện ô chọn động tùy theo Loại giao dịch */}
        {type === 'transfer' ? (
          <div>
            <label className="block text-sm text-slate-500 mb-1.5 font-medium">Tài khoản nhận</label>
            <select name="toAccountId" required className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium">
              <option value="">-- Chọn đích đến --</option>
              {accounts
                .filter(acc => acc.id !== parseInt(selectedSource)) // Ẩn tài khoản đang chọn làm nguồn để tránh tự chuyển cho chính mình
                .map((acc: any) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm text-slate-500 mb-1.5 font-medium">Hạng mục</label>
            <select name="categoryName" required className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium">
              <option value="">-- Chọn --</option>
              {type === 'expense' 
                ? EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                : INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
              }
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1.5 font-medium">Số tiền (VNĐ)</label>
          <input type="number" name="amount" required min="1" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium" />
        </div>
        <div>
          <label className="block text-sm text-slate-500 mb-1.5 font-medium">Diễn giải</label>
          <input type="text" name="notes" placeholder="VD: Rút tiền mặt, Chuyển khoản Momo..." className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium" />
        </div>
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm mt-2 shadow-md shadow-blue-200">
        Xác nhận ghi chép
      </button>
    </form>
  );
}