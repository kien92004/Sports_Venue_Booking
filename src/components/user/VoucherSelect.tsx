import React, { useEffect, useState } from 'react';

interface Voucher {
  voucherid: string;
  discountpercent: number;
  startdate: string;
  enddate: string;
}

interface UserVoucher {
  id: number;
  username: string;
  voucherid: Voucher;
  quantity: number;
  startDate: string;
  endDate: string;
}

interface VoucherSelectProps {
  username?: string;
  tamtinh?: number;
  onVoucherApplied?: (discountPercent: number, voucherOfUserId: number | null) => void;
  onApply?: (discountCode: string | null, newThanhtien: number, voucherOfUserId: number | null) => void;
}

// Use VITE_BACKEND_URL for backend API calls
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
const VoucherSelect: React.FC<VoucherSelectProps> = ({ username, tamtinh, onVoucherApplied, onApply }) => {
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [_voucherOfUserId, setVoucherOfUserId] = useState<number | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [_appliedCode, setAppliedCode] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);

  useEffect(() => {
    if (username) {
      fetch(`${URL_BACKEND}/api/user/voucher-of-user?username=${username}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setUserVouchers(data);
        })
        .catch(err => console.error('Error fetching vouchers:', err));
    }
  }, [username]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoucherId = e.target.value;
    // If user selected the "no voucher" option, clear selection
    if (selectedVoucherId === 'none') {
      setDiscountCode('none');
      setVoucherOfUserId(null);
      setSelectedVoucher(null);
      return;
    }

    const selectedVoucher = userVouchers.find(uv => uv.voucherid.voucherid === selectedVoucherId);

    setDiscountCode(selectedVoucherId);
    if (selectedVoucher) {
      setVoucherOfUserId(selectedVoucher.id);
      setSelectedVoucher(selectedVoucher);
    } else {
      setVoucherOfUserId(null);
      setSelectedVoucher(null);
    }
  };

  const handleApplyDiscount = async (e: React.MouseEvent) => {
    e.preventDefault();

    // If user chose "no voucher", clear any applied voucher and restore original price
    if (discountCode === 'none') {
      setAppliedCode(null);
      setVoucherOfUserId(null);
      setSelectedVoucher(null);
      if (tamtinh && onApply) {
        onApply(null, tamtinh, null);
      } else if (tamtinh && onVoucherApplied) {
        // also notify voucher cleared
        onVoucherApplied(0, null);
      }
      if (onVoucherApplied) onVoucherApplied(0, null);
      alert('Voucher đã được hủy, giá trở về ban đầu.');
      return;
    }

    if (!discountCode || !selectedVoucher) {
      alert('Vui lòng chọn voucher!');
      return;
    }

    // Store the current voucher ID
    const currentVoucherId = selectedVoucher.id;

    try {
      const res = await fetch(
        `${URL_BACKEND}/api/user/order/cart/voucher?voucherId=${encodeURIComponent(discountCode)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ discountPercent: 0 }),
        }
      );

      if (!res.ok) throw new Error(`API trả về lỗi ${res.status}`);

      const data = await res.json();
      const discountPercent = data?.discountPercent ?? 0;
      const voucherMsg = data?.voucherMsg || "";

      if (discountPercent > 0) {
        setAppliedCode(discountCode);
        setVoucherOfUserId(currentVoucherId);

        if (tamtinh && onApply) {
          const newThanhtien = tamtinh * (1 - discountPercent / 100);
          onApply(discountCode, newThanhtien, currentVoucherId);
        }
        if (onVoucherApplied) {
          onVoucherApplied(discountPercent, currentVoucherId);
        }
        alert(voucherMsg || `Mã giảm giá "${discountCode}" đã được áp dụng!`);
      } else {
        setAppliedCode(null);
        setVoucherOfUserId(null);
        if (onVoucherApplied) {
          onVoucherApplied(0, null);
        }
        alert(voucherMsg || `Mã giảm giá "${discountCode}" không hợp lệ hoặc đã hết hạn.`);
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi áp dụng mã giảm giá!");
      setAppliedCode(null);
      setVoucherOfUserId(null);
      if (tamtinh && onApply) {
        onApply(null, tamtinh, null);
      }
      if (onVoucherApplied) {
        onVoucherApplied(0, null);
      }
    }
  };

  return (
    <div>
      <label>Mã giảm giá:</label>
      <select
        value={discountCode}
        onChange={handleSelectChange}
        className="form-control"
      >
        <option value="">Chọn voucher</option>
        <option value="none">Không voucher</option>
        {userVouchers.map((uv) => (
          <option
            key={uv.id}
            value={uv.voucherid.voucherid}
            data-voucher-of-user-id={uv.id}
          >
            {uv.voucherid.voucherid} - Giảm {uv.voucherid.discountpercent}%
            (Còn {uv.quantity} lượt) - HSD: {new Date(uv.endDate).toLocaleDateString()}
          </option>
        ))}
      </select>
      <button className="btn btn-primary py-3 px-4 mt-3" onClick={handleApplyDiscount}>
        Áp dụng
      </button>
    </div>
  );
};


export default VoucherSelect;
