import React, { useState } from 'react';
import CheckOTP from './CheckOTP';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const ForgetPass: React.FC = () => {
	const [fpUsername, setFpUsername] = useState('');
	const [fpEmail, setFpEmail] = useState('');
	const [fpError, setFpError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [showCheckOTP, setShowCheckOTP] = useState(false);

	const submitForgetPass = async (e: React.FormEvent) => {
		e.preventDefault();
		setFpError(null);
		setMessage(null);

		if (!fpUsername.trim() || !fpEmail.trim()) {
			setFpError('Vui lòng điền tên tài khoản và email');
			return;
		}

		try {
			setLoading(true);
			const payload = { username: fpUsername.trim(), email: fpEmail.trim() };
			const res = await fetch(`${URL_BACKEND}/api/user/forgotpassword`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setFpError(data?.message || `HTTP ${res.status}`);
				return;
			}

			if (data && data.success) {
				setMessage(data.message || 'Mã OTP đã được gửi tới email.');
				setShowCheckOTP(true);
			} else {
				setFpError(data?.message || 'Yêu cầu khôi phục thất bại');
			}
		} catch (err) {
			console.error('Forgot password error:', err);
			setFpError('Lỗi kết nối tới server');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-vh-100 d-flex align-items-center bg-light">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-md-8 col-lg-6 col-xl-5">
						<div className="card border-0 shadow-lg">
							<div className="card-body p-5">
								<div className="text-center mb-4">
									<div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
										<i className="fa fa-key fa-2x text-primary"></i>
									</div>
									<h2 className="h3 fw-bold text-primary">Quên mật khẩu</h2>
									<p className="text-muted">Đừng lo lắng! Chúng tôi sẽ giúp bạn khôi phục mật khẩu</p>
								</div>

								{fpError && (
									<div className="alert alert-danger alert-dismissible fade show" role="alert">
										<i className="fa fa-exclamation-triangle me-2"></i>
										{fpError}
										<button type="button" className="btn-close" onClick={() => setFpError(null)}></button>
									</div>
								)}

								{message && (
									<div className="alert alert-success alert-dismissible fade show" role="alert">
										<i className="fa fa-check-circle me-2"></i>
										{message}
										<button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
									</div>
								)}

								{!showCheckOTP && (
									<form onSubmit={submitForgetPass}>
										<div className="form-floating mb-3">
											<input
												id="inputUsername"
												type="text"
												name="usernameforgot"
												placeholder="Tên tài khoản"
												required
												className="form-control"
												value={fpUsername}
												onChange={e => setFpUsername(e.target.value)}
											/>
											<label htmlFor="inputUsername">
												<i className="fa fa-user me-2"></i>Tên tài khoản
											</label>
										</div>

										<div className="form-floating mb-4">
											<input
												id="inputEmail"
												type="email"
												placeholder="Email"
												required
												name="emailforgot"
												className="form-control"
												value={fpEmail}
												onChange={e => setFpEmail(e.target.value)}
											/>
											<label htmlFor="inputEmail">
												<i className="fa fa-envelope me-2"></i>Email đã đăng ký
											</label>
										</div>

										<div className="d-grid mb-4">
											<button type="submit" className="btn btn-primary btn-lg fw-medium" disabled={loading}>
												{loading ? (
													<>
														<span className="spinner-border spinner-border-sm me-2" role="status"></span>
														Đang gửi...
													</>
												) : (
													<>
														<i className="fa fa-paper-plane me-2"></i>
														Gửi mã khôi phục
													</>
												)}
											</button>
										</div>

										<div className="text-center">
											<a href="/login" className="text-decoration-none">
												<i className="fa fa-arrow-left me-1"></i>Quay lại đăng nhập
											</a>
										</div>
									</form>
								)}

								{showCheckOTP && (
									<div className="border-top pt-4">
										<CheckOTP
											username={fpUsername}
											email={fpEmail}
											onSuccess={() => {
												setMessage('Xác thực thành công! Vui lòng kiểm tra email để đặt lại mật khẩu.');
												setShowCheckOTP(false);
											}}
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgetPass;



