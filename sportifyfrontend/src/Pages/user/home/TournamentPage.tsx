import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeroSection from "../../../components/user/Hero";

interface TournamentPageProps {
  isCreate?: boolean;
  isDetail?: boolean;
}

const TournamentPage: React.FC<TournamentPageProps> = ({ isCreate = false, isDetail = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(isCreate ? "create" : isDetail ? "detail" : "list");
  const [subTab, setSubTab] = useState("info"); // info, matches, bracket
  const [showRegModal, setShowRegModal] = useState(false);
  const [regData, setRegData] = useState({
    teamName: "",
    captain: "",
    phone: "",
    note: ""
  });

  // Đồng bộ activeTab khi route thay đổi
  useEffect(() => {
    if (isCreate) setActiveTab("create");
    else if (isDetail) setActiveTab("detail");
    else setActiveTab("list");
  }, [isCreate, isDetail]);

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đăng ký thành công giải đấu cho đội: ${regData.teamName}`);
    setShowRegModal(false);
  };

  return (
    <>
      <HeroSection
        backgroundImage="/user/images/bg_3.jpg"
        title="Giải đấu"
        breadcrumbs={[
          { label: "Trang Chủ", href: "/sportify" },
          { label: "Giải đấu", href: "/sportify/tournament" }
        ]}
      />
      <section className="ftco-section bg-light">
        <div className="container">
          {activeTab !== "detail" && (
            <div className="row justify-content-center mb-5 pb-3">
              <div className="col-md-7 heading-section text-center">
                <h2 className="mb-4">{activeTab === "list" ? "Giải đấu đang diễn ra" : "Tạo giải đấu mới"}</h2>
                <p className="text-muted">
                  {activeTab === "list" 
                    ? "Khám phá các giải đấu sôi động và đăng ký tham gia ngay hôm nay." 
                    : "Xây dựng sân chơi chuyên nghiệp cho cộng đồng của bạn."}
                </p>
              </div>
            </div>
          )}
          
          <div className="row">
             {/* Danh sách giải đấu */}
             {activeTab === "list" && (
               <div className="col-md-12">
                 <div className="row">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="col-md-4 mb-5">
                        <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '15px', overflow: 'hidden', transition: 'transform 0.3s' }}>
                          <div style={{ height: '200px', overflow: 'hidden' }}>
                            <img 
                              src={`https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`} 
                              className="card-img-top" 
                              alt="tournament" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="card-body p-4 d-flex flex-column">
                            <h5 className="card-title text-success font-weight-bold mb-3">Giải Vô Địch Sportify Open 2024 - Khối #{i}</h5>
                            <p className="card-text text-muted mb-4 small">
                              Cơ hội tranh tài cùng các đội bóng mạnh nhất khu vực. Giải thưởng lên đến 10.000.000 VNĐ cùng cúp vô địch danh giá.
                            </p>
                            <div className="d-flex justify-content-between align-items-center mt-auto">
                              <div className="d-flex flex-column">
                                <span className="small text-muted font-weight-bold">Số đội: 16/16</span>
                                <span className="badge badge-pill badge-success mt-1">Đang diễn ra</span>
                              </div>
                              <button className="btn btn-success px-4" onClick={() => navigate(`/sportify/tournament/detail/${i}`)}>Chi tiết</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             )}

             {/* Tạo giải đấu */}
             {activeTab === "create" && (
               <div className="col-md-8 offset-md-2">
                 <div className="bg-white p-5 shadow rounded" style={{ borderTop: '5px solid #28a745' }}>
                    <form>
                      <div className="form-group mb-4">
                        <label className="font-weight-bold text-dark">Tên giải đấu</label>
                        <input type="text" className="form-control form-control-lg" placeholder="Nhập tên giải đấu (VD: Cúp Mùa Hè 2024)" />
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 form-group mb-4">
                          <label className="font-weight-bold text-dark">Môn thể thao</label>
                          <select className="form-control form-control-lg">
                            <option>Bóng đá</option>
                            <option>Cầu lông</option>
                            <option>Bóng rổ</option>
                            <option>Tennis</option>
                          </select>
                        </div>
                        <div className="col-md-6 form-group mb-4">
                          <label className="font-weight-bold text-dark">Số đội tham gia</label>
                          <select className="form-control form-control-lg">
                            <option>4 Đội</option>
                            <option>8 Đội</option>
                            <option>16 Đội</option>
                            <option>32 Đội</option>
                          </select>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 form-group mb-4">
                          <label className="font-weight-bold text-dark">Ngày bắt đầu</label>
                          <input type="date" className="form-control form-control-lg" />
                        </div>
                        <div className="col-md-6 form-group mb-4">
                          <label className="font-weight-bold text-dark">Ngày kết thúc (Dự kiến)</label>
                          <input type="date" className="form-control form-control-lg" />
                        </div>
                      </div>

                      <div className="form-group mb-4">
                        <label className="font-weight-bold text-dark">Mô tả giải đấu</label>
                        <textarea className="form-control" rows={5} placeholder="Thông tin chi tiết về giải thưởng, quy trình đăng ký, luật thi đấu..."></textarea>
                      </div>

                      <div className="form-group mb-4">
                        <label className="font-weight-bold text-dark">Ảnh bìa giải đấu</label>
                        <div className="custom-file">
                          <input type="file" className="custom-file-input" id="customFile" />
                          <label className="custom-file-label" htmlFor="customFile">Chọn file ảnh</label>
                        </div>
                      </div>

                      <div className="alert alert-info py-2 small mb-4">
                        <i className="fa fa-info-circle mr-2"></i>
                        Giải đấu của bạn sẽ được phê duyệt bởi quản trị viên trước khi hiển thị công khai.
                      </div>

                      <button type="button" className="btn btn-success btn-lg btn-block font-weight-bold py-3 mt-2 shadow-sm" onClick={() => alert('Chức năng đang được phát triển!')}>
                        Gửi Yêu Cầu Tạo Giải Đấu
                      </button>
                    </form>
                 </div>
               </div>
             )}

             {/* Chi tiết giải đấu */}
             {activeTab === "detail" && (
               <div className="col-md-12">
                 <div className="bg-white shadow rounded mb-4 overflow-hidden">
                    {/* Header Detail */}
                    <div className="bg-dark p-4 text-white d-flex align-items-center">
                       <div style={{ width: '120px', height: '120px', borderRadius: '15px', overflow: 'hidden', border: '3px solid #fff' }}>
                         <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       </div>
                       <div className="ml-4">
                         <h2 className="text-white font-weight-bold mb-1">Giải Vô Địch Sportify Open 2024 - Khối #{id}</h2>
                         <div className="d-flex align-items-center">
                           <span className="badge badge-success mr-3">Đang diễn ra</span>
                           <span className="small"><i className="fa fa-calendar mr-2"></i> 01/05/2024 - 30/05/2024</span>
                           <span className="small ml-3"><i className="fa fa-users mr-2"></i> 16 Đội tham gia</span>
                         </div>
                       </div>
                       <button className="btn btn-success ml-auto font-weight-bold px-4 py-2" onClick={() => setShowRegModal(true)}>Đăng ký tham gia</button>
                    </div>

                    {/* Navigation Sub-Tabs */}
                    <div className="bg-light border-bottom px-4 d-flex">
                       <button className={`btn py-3 px-4 font-weight-bold rounded-0 ${subTab === 'info' ? 'text-success border-bottom border-success' : 'text-muted'}`} onClick={() => setSubTab('info')} style={{ borderBottomWidth: '3px !important' }}>Thông tin</button>
                       <button className={`btn py-3 px-4 font-weight-bold rounded-0 ${subTab === 'matches' ? 'text-success border-bottom border-success' : 'text-muted'}`} onClick={() => setSubTab('matches')} style={{ borderBottomWidth: '3px !important' }}>Lịch thi đấu</button>
                       <button className={`btn py-3 px-4 font-weight-bold rounded-0 ${subTab === 'bracket' ? 'text-success border-bottom border-success' : 'text-muted'}`} onClick={() => setSubTab('bracket')} style={{ borderBottomWidth: '3px !important' }}>Sơ đồ thi đấu</button>
                    </div>

                    {/* Sub-Tab Content */}
                    <div className="p-4">
                       {subTab === 'info' && (
                         <div className="row">
                           <div className="col-md-8">
                             <h4 className="font-weight-bold mb-3">Mô tả giải đấu</h4>
                             <p className="text-muted">Giải vô địch bóng đá phong trào Sportify Open 2024 là sân chơi dành cho tất cả các đội bóng trong khu vực. Mục tiêu tạo ra môi trường giao lưu, rèn luyện sức khỏe và nâng cao tinh thần thể thao.</p>
                             <h4 className="font-weight-bold mt-4 mb-3">Quy định giải đấu</h4>
                             <ul className="text-muted list-unstyled">
                               <li><i className="fa fa-check text-success mr-2"></i> Mỗi đội đăng ký tối đa 15 cầu thủ.</li>
                               <li><i className="fa fa-check text-success mr-2"></i> Thi đấu theo thể thức sân 7 người.</li>
                               <li><i className="fa fa-check text-success mr-2"></i> Thời gian thi đấu: 2 hiệp, mỗi hiệp 25 phút.</li>
                               <li><i className="fa fa-check text-success mr-2"></i> Luật thay người không giới hạn.</li>
                             </ul>
                           </div>
                           <div className="col-md-4 border-left">
                             <h5 className="font-weight-bold mb-3">Cơ cấu giải thưởng</h5>
                             <div className="alert alert-warning border-0 shadow-sm p-3 mb-2">
                               <div className="font-weight-bold"><i className="fa fa-trophy mr-2"></i> Giải Nhất</div>
                               <div className="h4 font-weight-bold text-dark mb-0">10.000.000 VNĐ</div>
                             </div>
                             <div className="alert alert-light border shadow-sm p-3 mb-2">
                               <div className="font-weight-bold text-muted"><i className="fa fa-award mr-2"></i> Giải Nhì</div>
                               <div className="h4 font-weight-bold text-dark mb-0">5.000.000 VNĐ</div>
                             </div>
                           </div>
                         </div>
                       )}

                       {subTab === 'matches' && (
                         <div className="table-responsive">
                            <table className="table table-hover">
                              <thead className="thead-light">
                                <tr>
                                  <th>Ngày/Giờ</th>
                                  <th>Vòng</th>
                                  <th className="text-right">Đội 1</th>
                                  <th className="text-center">Kết quả</th>
                                  <th>Đội 2</th>
                                  <th>Sân</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[1, 2, 3, 4].map((m) => (
                                  <tr key={m}>
                                    <td className="align-middle">15/05/2024 08:00</td>
                                    <td className="align-middle font-weight-bold text-success">Vòng Bảng</td>
                                    <td className="text-right align-middle">Đội FC A</td>
                                    <td className="text-center align-middle">
                                      <span className="bg-dark text-white px-3 py-1 rounded font-weight-bold">2 - 1</span>
                                    </td>
                                    <td className="align-middle">Đội FC B</td>
                                    <td className="align-middle">Sân số {m}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                         </div>
                       )}

                       {subTab === 'bracket' && (
                         <div className="text-center py-5">
                            <img src="https://www.bracketpro.io/img/bracket_placeholder.png" alt="bracket" className="img-fluid opacity-50" style={{ maxWidth: '600px', filter: 'grayscale(1)' }} />
                            <div className="mt-4 text-muted">Sơ đồ thi đấu sẽ được tự động cập nhật sau khi kết thúc vòng bảng.</div>
                         </div>
                       )}
                    </div>
                 </div>
                 <button className="btn btn-outline-dark mb-5" onClick={() => navigate('/sportify/tournament')}>
                   <i className="fa fa-arrow-left mr-2"></i> Quay lại danh sách
                 </button>
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: '20px' }}>
              <div className="modal-header bg-success text-white border-0 py-3" style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                <h5 className="modal-title font-weight-bold text-white">Đăng ký tham gia giải đấu</h5>
                <button type="button" className="close text-white" onClick={() => setShowRegModal(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleRegSubmit}>
                  <div className="form-group mb-3">
                    <label className="font-weight-bold">Tên đội bóng</label>
                    <input type="text" className="form-control" placeholder="Nhập tên đội của bạn" required value={regData.teamName} onChange={(e) => setRegData({...regData, teamName: e.target.value})} />
                  </div>
                  <div className="form-group mb-3">
                    <label className="font-weight-bold">Người đại diện (Đội trưởng)</label>
                    <input type="text" className="form-control" placeholder="Họ và tên người đại diện" required value={regData.captain} onChange={(e) => setRegData({...regData, captain: e.target.value})} />
                  </div>
                  <div className="form-group mb-3">
                    <label className="font-weight-bold">Số điện thoại liên hệ</label>
                    <input type="tel" className="form-control" placeholder="Nhập số điện thoại" required value={regData.phone} onChange={(e) => setRegData({...regData, phone: e.target.value})} />
                  </div>
                  <div className="form-group mb-4">
                    <label className="font-weight-bold">Ghi chú (Nếu có)</label>
                    <textarea className="form-control" rows={3} placeholder="Danh sách cầu thủ sơ bộ hoặc yêu cầu đặc biệt..." value={regData.note} onChange={(e) => setRegData({...regData, note: e.target.value})}></textarea>
                  </div>
                  <div className="alert alert-warning py-2 small mb-4">
                    <i className="fa fa-exclamation-triangle mr-2"></i>
                    Bằng việc đăng ký, bạn cam kết tuân thủ mọi quy định của giải đấu.
                  </div>
                  <button type="submit" className="btn btn-success btn-block font-weight-bold py-2 shadow-sm">Xác nhận đăng ký</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TournamentPage;
