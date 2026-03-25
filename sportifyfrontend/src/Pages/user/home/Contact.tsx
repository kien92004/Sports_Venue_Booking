
import React, { useEffect, useState } from 'react';
import Nav_contact from '../../../components/user/Nav_contact';
import { sendContact } from '../../../service/user/home/contactApi';
type ContactPayload = {
  category: string | null;
  title: string | null;
  meesagecontact: string | null;
};

const Contact: React.FC = () => {
  const [contactType, setContactType] = useState<string>('Giao diện');
  const [title, setTitle] = useState<string>('');
  const [meesagecontact, setMeesagecontact] = useState<string>('');
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [message1, setMessage1] = useState<string | null>(null);

  useEffect(() => {
    // Clear server messages after a timeout
    if (message || message1) {
      const t = setTimeout(() => {
        setMessage(null);
        setMessage1(null);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [message, message1]);

  const validate = () => {
    let ok = true;
    if (!title || title.trim() === '') {
      setErrorTitle('Tiêu đề không được để trống');
      ok = false;
    } else if (title.length > 250) {
      setErrorTitle('Tiêu đề không được quá 250 ký tự');
      ok = false;
    } else {
      setErrorTitle(null);
    }

    if (!meesagecontact || meesagecontact.trim() === '') {
      setErrorMessage('Nội dung không được để trống');
      ok = false;
    } else if (meesagecontact.length > 800) {
      setErrorMessage('Nội dung không được quá 800 ký tự');
      ok = false;
    } else {
      setErrorMessage(null);
    }

    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      contacts: {
        category: contactType,
        title,
        meesagecontact,
      } as ContactPayload,
    };

    try {
      const data = await sendContact(payload);
      // Expecting structure similar to sample: { contacts: {...}, status: 'success', username: null }
      if (data && data.status && data.status === 'success') {
        setMessage('Gửi phản hồi thành công. Cảm ơn bạn!');
        setTitle('');
        setMeesagecontact('');
      } else {
        setMessage1('Gửi phản hồi không thành công. Vui lòng thử lại.');
      }
    } catch (err) {
      setMessage1('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.');
    }
  };

  return (
    <>
      <Nav_contact title="Liên Hệ - Góp Ý" />

      <section className="ftco-section" style={{ backgroundImage: `url('/user/images/bgAll.png')`, backgroundRepeat: 'repeat', backgroundSize: '100% 100%' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-12">
              <div className="wrapper px-md-4">
                <div className="row no-gutters">
                  <div className="col-md-7">
                    <div className="contact-wrap w-100 p-md-5 p-4">
                      <h3 className="mb-4" style={{ color: '#2E7D32', textAlign: 'center' }}>Liện Hệ - Góp Ý</h3>
                      <form onSubmit={handleSubmit} id="contactForm" name="contactForm" className="contactForm">
                        <div className="row">
                          <div className="col-md-12">
                            <div className="form-group">
                              <h4 className="m-1 mr-2" style={{ color: 'Black' }}>Xin chào !</h4>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="form-group">
                              <label className="label" htmlFor="subject">Loại phản hồi</label>
                              <select
                                name="contactType"
                                className="custom-select contact-select"
                                value={contactType}
                                onChange={(e) => setContactType(e.target.value)}
                              >
                                <option value="Giao diện">Giao diện</option>
                                <option value="Chức năng">Chức năng</option>
                                <option value="Hiệu suất">Hiệu suất</option>
                                <option value="Liên hệ quảng cáo">Liên hệ quảng cáo</option>
                                <option value="Khác">Khác</option>
                              </select>
                            </div>
                          </div>

                          <div className="col-md-12">
                            <div className="form-group">
                              <label className="label" htmlFor="title">Tiêu đề</label>
                              <input
                                type="text"
                                className="form-control"
                                name="title"
                                id="title"
                                placeholder="Nhập tiêu đề..."
                                maxLength={250}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                              />
                              {errorTitle && (
                                <span className="error-message" style={{ display: 'block' }}>
                                  <div className="text-danger" style={{ marginTop: 6 }}>{errorTitle}</div>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-md-12">
                            <div className="form-group">
                              <label className="label">Nội dung</label>
                              <textarea
                                className="form-control"
                                id="meesagecontact"
                                maxLength={800}
                                cols={30}
                                rows={4}
                                placeholder="Nhập nội dung..."
                                value={meesagecontact}
                                onChange={(e) => setMeesagecontact(e.target.value)}
                              />
                              {errorMessage && (
                                <span className="error-message2" style={{ display: 'block' }}>
                                  <div className="text-danger" style={{ marginTop: 6 }}>{errorMessage}</div>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-md-12">
                            <div className="form-group">
                              <button type="submit" className="btn btn-primary">Gửi Phản Hồi</button>
                            </div>
                          </div>

                          {message && (
                            <div className="col-12 fixed-top" id="messageDiv" style={{ display: 'block' }}>
                              <div className="col-3 alert alert-success"
                                style={{ position: 'fixed', top: '0px', right: '0px', zIndex: 9999, fontSize: '15px' }}>
                                <p>{message}</p>
                              </div>
                            </div>
                          )}

                          {message1 && (
                            <div className="col-12 fixed-top" id="messageDiv1" style={{ display: 'block' }}>
                              <div className="col-3 alert alert-warning"
                                style={{ position: 'fixed', top: '0px', right: '0px', zIndex: 9999, fontSize: '15px' }}>
                                <p>{message1}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="col-md-5 order-md-first d-flex align-items-stretch" style={{ border: '3px solid #2E7D32' }}>
                    <iframe
                      title="location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7675889130314!2d106.68950957575302!3d10.829089789322925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528f6e9e290ab%3A0xa322309091295c37!2zMTA0IMSQLiBUcuG6p24gQsOhIEdpYW8sIFBoxrDhu51uZyA1LCBHw7IgVuG6pXAsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1765182757073!5m2!1svi!2s"
                      style={{ border: 0, width: '100%', minHeight: '420px', flexGrow: 1 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
              <br />
              <br />
              <div className="row mb-5">
                <div className="col-md-3">
                  <div className="dbox w-100 text-center">
                    <div className="icon d-flex align-items-center justify-content-center">
                      <span className="fa fa-map-marker"></span>
                    </div>
                    <div className="text">
                      <p>
                        <span>Address: </span>104 Đ. Trần Bá Giao, Phường 5, Gò Vấp, Hồ Chí Minh, Việt Nam
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="dbox w-100 text-center">
                    <div className="icon d-flex align-items-center justify-content-center">
                      <span className="fa fa-phone"></span>
                    </div>
                    <div className="text">
                      <p>
                        <span>Phone:</span> 0366635625
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="dbox w-100 text-center">
                    <div className="icon d-flex align-items-center justify-content-center">
                      <span className="fa fa-paper-plane"></span>
                    </div>
                    <div className="text">
                      <p>
                        <span>Email:</span> <a href="mailto:info@yoursite.com">phamleducngoc123@gmail.com</a>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="dbox w-100 text-center">
                    <div className="icon d-flex align-items-center justify-content-center">
                      <span className="fa fa-globe"></span>
                    </div>
                    <div className="text">
                      <p>
                        <span>Website</span> <a href="#">sportify</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        .contact-select {
          min-height: 52px;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          font-size: 1rem;
        }
        .contact-select option {
          font-size: 1rem;
        }
      `}</style>
    </>
  );
};

export default Contact;