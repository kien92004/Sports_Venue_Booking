import React, { useState } from 'react';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

type Props = {
	username?: string;
	email?: string;
	onSuccess?: () => void;
};

const CheckOTP: React.FC<Props> = ({ username, email, onSuccess }) => {
	const [otp, setOtp] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const submitOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);
		setError(null);
		if (!otp.trim()) {
			setError('Vui lòng nhập mã OTP');
			return;
		}

		try {
			setLoading(true);
			const payload: any = { otp: otp.trim() };
			if (username) payload.username = username;
			if (email) payload.email = email;

			const res = await fetch(`${URL_BACKEND}/api/sportify/checkOTP`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setError(data?.message || `HTTP ${res.status}`);
				return;
			}

			if (data && data.success) {
				setMessage(data.message || 'Xác thực thành công');
				onSuccess && onSuccess();
			} else {
				setError(data?.message || 'Xác thực thất bại');
			}
		} catch (err) {
			console.error(err);
			setError('Lỗi kết nối tới server');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="row">
				<div className="col-lg-8 col-xl-6 mx-auto">
					<h4 className="mb-3">Xác thực OTP</h4>
					<form onSubmit={submitOTP}>
						<div className="form-group mb-3">
							<input
								type="text"
								maxLength={10}
								placeholder="Nhập mã OTP"
								className="form-control rounded-pill"
								value={otp}
								onChange={e => setOtp(e.target.value)}
							/>
						</div>

						<button type="submit" className="btn btn-primary rounded-pill" disabled={loading}>
							{loading ? 'Đang xác thực...' : 'Xác thực OTP'}
						</button>
					</form>

					{message && <div className="alert alert-success mt-3">{message}</div>}
					{error && <div className="alert alert-danger mt-3">{error}</div>}
				</div>
			</div>
		</div>
	);
};

export default CheckOTP;
