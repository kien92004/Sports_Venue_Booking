import React, { useState } from 'react';
import { validateSignup } from '../../helper/validateSignup';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;


type OwnerFormState = {
	applicantName: string;
	phone: string;
	email: string;
	address: string;
	idNumber: string;
	username: string;
	password: string;
	idCardFront: File | null;
	idCardBack: File | null;
	businessLicense: File | null;
};

const createOwnerInitialState = (): OwnerFormState => ({
	applicantName: '',
	phone: '',
	email: '',
	address: '',
	idNumber: '',
	username: '',
	password: '',
	idCardFront: null,
	idCardBack: null,
	businessLicense: null,
});

export default function Register() {
	// Signup fields required by API
	const [firstnameSignUp, setFirstnameSignUp] = useState('');
	const [lastnameSignUp, setLastnameSignUp] = useState('');
	const [usernameSignUp, setUsernameSignUp] = useState('');
	const [passwordSignUp, setPasswordSignUp] = useState('');
	const [phoneSignUp, setPhoneSignUp] = useState('');
	const [genderSignUp, setGenderSignUp] = useState(false);
	const [addressSignUp, setAddressSignUp] = useState('');
	const [emailSignUp, setEmailSignUp] = useState('');

	// UI state
	const [signupResult, setSignupResult] = useState<string | null>(null);
	// const [notification, setNotification] = useState<string | null>(null); // Not currently used
	const [activeTab, setActiveTab] = useState<'user' | 'owner'>('user');
	const [ownerForm, setOwnerForm] = useState<OwnerFormState>(() => createOwnerInitialState());
	const [ownerResult, setOwnerResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [ownerSubmitting, setOwnerSubmitting] = useState(false);
	const [fileResetKey, setFileResetKey] = useState(0);

	const handleSignupChange = (field: string, value: any) => {
		switch (field) {
			case 'firstname':
				setFirstnameSignUp(value);
				break;
			case 'lastname':
				setLastnameSignUp(value);
				break;
			case 'username':
				setUsernameSignUp(value);
				break;
			case 'passwords':
			case 'password':
				setPasswordSignUp(value);
				break;
			case 'phone':
				setPhoneSignUp(value);
				break;
			case 'gender':
				setGenderSignUp(Boolean(value));
				break;
			case 'address':
				setAddressSignUp(value);
				break;
			case 'email':
				setEmailSignUp(value);
				break;
			default:
				break;
		}

	};

	const handleOwnerInputChange = (
		field: 'applicantName' | 'phone' | 'email' | 'address' | 'idNumber' | 'username' | 'password',
		value: string
	) => {
		setOwnerForm(prev => ({ ...prev, [field]: value }));
	};

	const handleOwnerFileChange = (field: 'idCardFront' | 'idCardBack' | 'businessLicense', file: File | null) => {
		setOwnerForm(prev => ({ ...prev, [field]: file }));
	};

	const submitSignup = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		// basic required-fields validation
		const error = validateSignup({
			username: usernameSignUp,
			password: passwordSignUp,
			firstname: firstnameSignUp,
			lastname: lastnameSignUp,
			phone: phoneSignUp,
			email: emailSignUp,
			address: addressSignUp,
			gender: genderSignUp,
		});

		if (error) {

			setSignupResult(error);
			return;
		}

		try {
			const payload = {
				firstname: firstnameSignUp,
				lastname: lastnameSignUp,
				username: usernameSignUp,
				password: passwordSignUp,
				phone: phoneSignUp,
				gender: genderSignUp,
				address: addressSignUp,
				email: emailSignUp
			};

			console.log('Signup payload:', payload);
			const res = await fetch(`${URL_BACKEND}/api/sportify/signup/process`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setSignupResult('Signup successful');
		} catch (err: any) {
			setSignupResult(`Signup failed: ${err.message}`);
		}
	};

	const submitOwnerRegistration = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		setOwnerResult(null);

		if (!ownerForm.applicantName.trim()) {
			setOwnerResult({ type: 'error', message: 'Vui lòng nhập họ tên hoặc tên đơn vị kinh doanh.' });
			return;
		}

		if (!ownerForm.phone.trim()) {
			setOwnerResult({ type: 'error', message: 'Vui lòng nhập số điện thoại liên hệ.' });
			return;
		}

		if (!ownerForm.email.trim()) {
			setOwnerResult({ type: 'error', message: 'Vui lòng nhập email doanh nghiệp.' });
			return;
		}

		if (!ownerForm.address.trim()) {
			setOwnerResult({ type: 'error', message: 'Vui lòng nhập địa chỉ liên hệ.' });
			return;
		}

		if (!ownerForm.idCardFront || !ownerForm.idCardBack) {
			setOwnerResult({ type: 'error', message: 'Vui lòng tải lên đầy đủ hình ảnh CCCD/CMND/Hộ chiếu.' });
			return;
		}

		if (!ownerForm.username.trim()) {
			setOwnerResult({ type: 'error', message: 'Vui lòng nhập tên đăng nhập dành cho chủ sân.' });
			return;
		}

		if (/\s/.test(ownerForm.username)) {
			setOwnerResult({ type: 'error', message: 'Tên đăng nhập không được chứa khoảng trắng.' });
			return;
		}

		if (ownerForm.username.trim().length < 6 || ownerForm.username.trim().length > 15) {
			setOwnerResult({ type: 'error', message: 'Tên đăng nhập phải từ 6 đến 15 ký tự.' });
			return;
		}

		if (!ownerForm.password.trim()) {
			setOwnerResult({ type: 'error', message: 'Vui lòng nhập mật khẩu cho tài khoản chủ sân.' });
			return;
		}

		if (ownerForm.password.trim().length < 6 || ownerForm.password.trim().length > 15) {
			setOwnerResult({ type: 'error', message: 'Mật khẩu phải từ 6 đến 15 ký tự.' });
			return;
		}

		setOwnerSubmitting(true);
		try {
			const formData = new FormData();
			formData.append('applicantName', ownerForm.applicantName.trim());
			formData.append('phone', ownerForm.phone.trim());
			formData.append('email', ownerForm.email.trim());
			formData.append('contactAddress', ownerForm.address.trim());
			if (ownerForm.idNumber.trim()) {
				formData.append('idNumber', ownerForm.idNumber.trim());
			}
			formData.append('username', ownerForm.username.trim());
			formData.append('password', ownerForm.password.trim());
			formData.append('idCardFront', ownerForm.idCardFront);
			formData.append('idCardBack', ownerForm.idCardBack);
			if (ownerForm.businessLicense) {
				formData.append('businessLicense', ownerForm.businessLicense);
			}

			const response = await fetch('${URL_BACKEND}/api/sportify/field-owner/register', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json().catch(() => ({}));
			if (!response.ok || !data.success) {
				throw new Error(data.message || `HTTP ${response.status}`);
			}

			setOwnerResult({
				type: 'success',
				message: data.message || 'Gửi yêu cầu đăng ký chủ sân thành công.',
			});
			setOwnerForm(createOwnerInitialState());
			setFileResetKey(prev => prev + 1);
		} catch (err: any) {
			setOwnerResult({
				type: 'error',
				message: `Gửi yêu cầu thất bại: ${err.message}`,
			});
		} finally {
			setOwnerSubmitting(false);
		}
	};

	return (
		<div className="min-vh-100 d-flex align-items-center bg-light py-5">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-md-10 col-lg-8 col-xl-7">
						<div className="card border-0 shadow-lg">
							<div className="card-body p-5">
								<div className="text-center mb-4">
									<h2 className="h3 fw-bold text-primary">
										{activeTab === 'user' ? 'Đăng ký tài khoản' : 'Đăng ký chủ sân'}
									</h2>
									<p className="text-muted">
										{activeTab === 'user'
											? 'Tạo tài khoản mới để trải nghiệm dịch vụ của chúng tôi'
											: 'Gửi thông tin để trở thành đối tác chủ sân của Sportify'}
									</p>
								</div>

								<div className="mb-4">
									<div className="btn-group w-100" role="group" aria-label="Chọn loại đăng ký">
										<button
											type="button"
											className={`btn ${activeTab === 'user' ? 'btn-primary' : 'btn-outline-primary'}`}
											onClick={() => setActiveTab('user')}
										>
											<i className="fa fa-user me-2"></i>Đăng ký tài khoản
										</button>
										<button
											type="button"
											className={`btn ${activeTab === 'owner' ? 'btn-success' : 'btn-outline-success'}`}
											onClick={() => setActiveTab('owner')}
										>
											<i className="fa fa-building me-2"></i>Đăng ký chủ sân
										</button>
									</div>
								</div>

								{activeTab === 'user' ? (
									<>
										{signupResult && (
											<div className={`alert ${signupResult.includes('successful') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
												<i className={`fa ${signupResult.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
												{signupResult}
											</div>
										)}

										<form onSubmit={submitSignup}>
											<div className="row g-3">
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="username"
															value={usernameSignUp}
															onChange={e => handleSignupChange('username', e.target.value)}
															placeholder="Tên đăng nhập"
															required
														/>
														<label htmlFor="username">
															<i className="fa fa-user me-2"></i>Tên đăng nhập
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="password"
															type="password"
															value={passwordSignUp}
															onChange={e => handleSignupChange('passwords', e.target.value)}
															placeholder="Mật khẩu"
															required
														/>
														<label htmlFor="password">
															<i className="fa fa-lock me-2"></i>Mật khẩu
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="firstname"
															value={firstnameSignUp}
															onChange={e => handleSignupChange('firstname', e.target.value)}
															placeholder="Họ"
															required
														/>
														<label htmlFor="firstname">
															<i className="fa fa-id-card me-2"></i>Họ
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="lastname"
															value={lastnameSignUp}
															onChange={e => handleSignupChange('lastname', e.target.value)}
															placeholder="Tên"
															required
														/>
														<label htmlFor="lastname">
															<i className="fa fa-id-card me-2"></i>Tên
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="phone"
															type="tel"
															value={phoneSignUp}
															onChange={e => handleSignupChange('phone', e.target.value)}
															placeholder="Số điện thoại"
															required
														/>
														<label htmlFor="phone">
															<i className="fa fa-phone me-2"></i>Số điện thoại
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="email"
															type="email"
															value={emailSignUp}
															onChange={e => handleSignupChange('email', e.target.value)}
															placeholder="Email"
															required
														/>
														<label htmlFor="email">
															<i className="fa fa-envelope me-2"></i>Email
														</label>
													</div>
												</div>
												<div className="col-md-8">
													<div className="form-floating">
														<input
															className="form-control"
															id="address"
															value={addressSignUp}
															onChange={e => handleSignupChange('address', e.target.value)}
															placeholder="Địa chỉ"
															required
														/>
														<label htmlFor="address">
															<i className="fa fa-map-marker-alt me-2"></i>Địa chỉ
														</label>
													</div>
												</div>
												<div className="col-md-4">
													<div className="form-floating">
														<select
															className="form-select"
															id="gender"
															value={genderSignUp ? 'true' : 'false'}
															onChange={e => handleSignupChange('gender', e.target.value === 'true')}
														>
															<option value="false">Nữ</option>
															<option value="true">Nam</option>
														</select>
														<label htmlFor="gender">
															<i className="fa fa-venus-mars me-2"></i>Giới tính
														</label>
													</div>
												</div>
											</div>

											<div className="d-grid gap-2 mt-4">
												<button className="btn btn-primary btn-lg fw-medium" type="submit">
													<i className="fa fa-user-plus me-2"></i>Đăng ký tài khoản
												</button>
											</div>

											<div className="text-center mt-4">
												<div className="border-top pt-4">
													<p className="text-muted mb-0">
														Đã có tài khoản?
														<a href="/login" className="text-decoration-none fw-medium ms-1">
															Đăng nhập ngay
														</a>
													</p>
												</div>
											</div>
										</form>
									</>
								) : (
									<>
										{ownerResult && (
											<div className={`alert ${ownerResult.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
												<i className={`fa ${ownerResult.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
												{ownerResult.message}
											</div>
										)}

										<form onSubmit={submitOwnerRegistration} className="mt-4" encType="multipart/form-data">
											<div className="row g-3">
												<div className="col-12">
													<div className="form-floating">
														<input
															className="form-control"
															id="ownerName"
															value={ownerForm.applicantName}
															onChange={e => handleOwnerInputChange('applicantName', e.target.value)}
															placeholder="Họ tên hoặc tên đơn vị kinh doanh"
															required
														/>
														<label htmlFor="ownerName">
															<i className="fa fa-user-tie me-2"></i>Họ tên hoặc tên đơn vị kinh doanh
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="ownerPhone"
															type="tel"
															value={ownerForm.phone}
															onChange={e => handleOwnerInputChange('phone', e.target.value)}
															placeholder="Số điện thoại"
															required
														/>
														<label htmlFor="ownerPhone">
															<i className="fa fa-phone me-2"></i>Số điện thoại
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="ownerEmail"
															type="email"
															value={ownerForm.email}
															onChange={e => handleOwnerInputChange('email', e.target.value)}
															placeholder="Email doanh nghiệp"
															required
														/>
														<label htmlFor="ownerEmail">
															<i className="fa fa-envelope me-2"></i>Email doanh nghiệp
														</label>
													</div>
												</div>
												<div className="col-12">
													<div className="form-floating">
														<input
															className="form-control"
															id="ownerAddress"
															value={ownerForm.address}
															onChange={e => handleOwnerInputChange('address', e.target.value)}
															placeholder="Địa chỉ liên hệ"
															required
														/>
														<label htmlFor="ownerAddress">
															<i className="fa fa-map-marker-alt me-2"></i>Địa chỉ liên hệ
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="ownerUsername"
															value={ownerForm.username}
															onChange={e => handleOwnerInputChange('username', e.target.value)}
															placeholder="Tên đăng nhập"
															maxLength={15}
															required
														/>
														<label htmlFor="ownerUsername">
															<i className="fa fa-user me-2"></i>Tên đăng nhập
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="ownerPassword"
															type="password"
															value={ownerForm.password}
															onChange={e => handleOwnerInputChange('password', e.target.value)}
															placeholder="Mật khẩu"
															maxLength={15}
															required
														/>
														<label htmlFor="ownerPassword">
															<i className="fa fa-lock me-2"></i>Mật khẩu
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<div className="form-floating">
														<input
															className="form-control"
															id="ownerIdNumber"
															value={ownerForm.idNumber}
															onChange={e => handleOwnerInputChange('idNumber', e.target.value)}
															placeholder="Số CCCD/CMND/Hộ chiếu"
															maxLength={20}
														/>
														<label htmlFor="ownerIdNumber">
															<i className="fa fa-id-badge me-2"></i>Số CCCD/CMND/Hộ chiếu
														</label>
													</div>
												</div>
												<div className="col-md-6">
													<label className="form-label fw-medium" htmlFor="idCardFront">
														<i className="fa fa-id-card me-2"></i>CCCD/CMND/Hộ chiếu (mặt trước)
													</label>
													<input
														key={`id-front-${fileResetKey}`}
														className="form-control"
														id="idCardFront"
														type="file"
														accept="image/*,application/pdf"
														onChange={e => handleOwnerFileChange('idCardFront', e.target.files?.[0] ?? null)}
														required
													/>
													{ownerForm.idCardFront && (
														<small className="text-muted d-block mt-1">{ownerForm.idCardFront.name}</small>
													)}
												</div>
												<div className="col-md-6">
													<label className="form-label fw-medium" htmlFor="idCardBack">
														<i className="fa fa-id-card me-2"></i>CCCD/CMND/Hộ chiếu (mặt sau)
													</label>
													<input
														key={`id-back-${fileResetKey}`}
														className="form-control"
														id="idCardBack"
														type="file"
														accept="image/*,application/pdf"
														onChange={e => handleOwnerFileChange('idCardBack', e.target.files?.[0] ?? null)}
														required
													/>
													{ownerForm.idCardBack && (
														<small className="text-muted d-block mt-1">{ownerForm.idCardBack.name}</small>
													)}
												</div>
												<div className="col-12">
													<label className="form-label fw-medium" htmlFor="businessLicense">
														<i className="fa fa-file-contract me-2"></i>Giấy phép kinh doanh (nếu có)
													</label>
													<input
														key={`license-${fileResetKey}`}
														className="form-control"
														id="businessLicense"
														type="file"
														accept="image/*,application/pdf"
														onChange={e => handleOwnerFileChange('businessLicense', e.target.files?.[0] ?? null)}
													/>
													{ownerForm.businessLicense && (
														<small className="text-muted d-block mt-1">{ownerForm.businessLicense.name}</small>
													)}
												</div>
											</div>

											<div className="d-grid gap-2 mt-4">
												<button className="btn btn-success btn-lg fw-medium" type="submit" disabled={ownerSubmitting}>
													{ownerSubmitting ? (
														<>
															<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
															Đang gửi...
														</>
													) : (
														<>
															<i className="fa fa-paper-plane me-2"></i>Gửi yêu cầu
														</>
													)}
												</button>
											</div>
										</form>

										<div className="small text-muted mt-3">
											Yêu cầu của bạn sẽ được gửi tới đội ngũ Sportify. Chúng tôi sẽ liên hệ qua email sau khi xét duyệt. Tên đăng nhập và mật khẩu sẽ được kích hoạt sau khi quản trị viên phê duyệt.
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
