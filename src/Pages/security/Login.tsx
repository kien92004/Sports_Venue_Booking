import React, { useEffect, useState } from 'react';
import { checkLogin } from '../../helper/checkLogin';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const Login: React.FC = () => {
    const [notification, setNotification] = useState<string | null>(null);

    // Login form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(t);
        }
    }, [notification]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotification(null);

        try {
            const payloadLogin = { username, password };

            const res = await fetch(`${URL_BACKEND}/api/user/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payloadLogin),
            });

            // ❗ HTTP error (401, 403, 500…)
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();

            if (!data.success) {
                setNotification(data.message || 'Username or password is incorrect');
                return;
            }

            // ✅ Login success
            localStorage.setItem('username', data.username);
            setNotification('Login successful');

            const session = await checkLogin();

            switch (session.role) {
                case 'Field Owner':
                    window.location.href = '/owner/dashboard';
                    break;
                case 'Admin':
                    window.location.href = '/admin/dashboard';
                    break;
                default:
                    window.location.href = '/sportify';
            }

        } catch (error) {
            console.error('Login failed:', error);
            setNotification('Login failed');
        }
    };


    // Forgot password handler (not currently used)





    return (
        <div className="min-vh-100 d-flex align-items-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6 col-xl-5">
                        <div className="card border-0 shadow-lg">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <img src="/login/bg1.png" height="60" width="60" alt="Logo" className="mb-3" />
                                    <h2 className="h3 fw-bold text-primary">Đăng nhập Sportify</h2>
                                    <p className="text-muted">Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn</p>
                                </div>

                                {notification && (
                                    <div className={`alert ${notification.includes('successful') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                                        <i className={`fa ${notification.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                                        {notification}
                                        <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
                                    </div>
                                )}

                                <form onSubmit={handleLogin} className="needs-validation" noValidate>
                                    <div className="form-floating mb-3">
                                        <input
                                            name="username"
                                            type="text"
                                            id="username"
                                            placeholder="Tên đăng nhập"
                                            className="form-control"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            required
                                        />
                                        <label htmlFor="username">
                                            <i className="fa fa-user me-2"></i>Tên đăng nhập
                                        </label>
                                    </div>

                                    <div className="form-floating mb-4">
                                        <input
                                            name="password"
                                            type="password"
                                            id="password"
                                            placeholder="Mật khẩu"
                                            className="form-control"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                        <label htmlFor="password">
                                            <i className="fa fa-lock me-2"></i>Mật khẩu
                                        </label>
                                    </div>

                                    <div className="d-grid mb-4">
                                        <button className="btn btn-primary btn-lg fw-medium" type="submit">
                                            <i className="fa fa-sign-in-alt me-2"></i>Đăng nhập
                                        </button>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <a href="/login/forgotpassword" className="text-decoration-none">
                                            <i className="fa fa-key me-1"></i>Quên mật khẩu?
                                        </a>
                                        <button
                                            type="button"
                                            className="btn btn-link text-muted p-0"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.history.back();
                                            }}
                                        >
                                            <i className="fa fa-arrow-left me-1"></i>Quay lại
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <div className="border-top pt-4">
                                            <p className="text-muted mb-0">
                                                Chưa có tài khoản?
                                                <a href="/register" className="text-decoration-none fw-medium ms-1">
                                                    Đăng ký ngay
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;