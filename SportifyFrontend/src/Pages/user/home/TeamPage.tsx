import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../../../components/user/Hero";
import getImageUrl from "../../../helper/getImageUrl";
import { useNotification } from "../../../helper/NotificationContext";


const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
interface SportType {
  sporttypeid: string;
  categoryname: string;
}

interface TeamItem {
  id: number;
  name: string;
  quantity?: number;
  maxQuantity?: number;
  avatar?: string;
  createdDate?: string;
  sport?: string;
  leader?: string;
  description?: string;
  contact?: string;
}

const sporttypeList: SportType[] = [
  { sporttypeid: "B01", categoryname: "Bóng đá" },
  { sporttypeid: "C01", categoryname: "Cầu lông" },
  { sporttypeid: "R01", categoryname: "Bóng rổ" },
  { sporttypeid: "T01", categoryname: "Tennis" },
];

const TeamPage: React.FC = () => {
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const { addNotification } = useNotification();

  // Form state
  const [formData, setFormData] = useState({
    newNameteam: "",
    newAvatar: null as File | null,
    newContact: "",
    newQuantity: "",
    newSporttypeid: "B01",
    newDescriptions: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searchText, setSearchText] = useState("");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [allTeams, setAllTeams] = useState<TeamItem[]>([]); // Lưu tất cả teams
  const [myTeams, setMyTeams] = useState<TeamItem[]>([]); // Lưu my teams
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMyTeamsOnly, setShowMyTeamsOnly] = useState(false);
  const navigate = useNavigate();

  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

  const handleEnterTeam = async (team: TeamItem) => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/user/team/teamdetail/${team.id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        // ✅ User là owner → chuyển hướng đến trang quản lý team
        if (data.role === "owner" || data.role === "member") {
          navigate(`/sportify/team/detailteam/${team.id}`);
        } else {
          alert(data.message);
          addNotification(data.message, "success");
        }
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Đã xảy ra lỗi khi kiểm tra team";
      alert(errorMessage);
      addNotification(errorMessage, "error");
    }
  };

  // --- Helpers ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, newAvatar: e.target.files[0] });
    }
  };


  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate team name (nameteam - max 50 characters, required)
    if (!formData.newNameteam) {
      newErrors.newNameteam = "Tên nhóm không được để trống";
    } else if (formData.newNameteam.length > 50) {
      newErrors.newNameteam = "Tên nhóm không được vượt quá 50 ký tự";
    } else if (formData.newNameteam.trim().length === 0) {
      newErrors.newNameteam = "Tên nhóm không được chỉ chứa khoảng trắng";
    }

    // Validate contact (max 10 characters, required, should be numeric)
    if (!formData.newContact) {
      newErrors.newContact = "Số liên hệ không được để trống";
    } else if (formData.newContact.length > 10) {
      newErrors.newContact = "Số liên hệ không được vượt quá 10 ký tự";
    } else if (!/^\d{10}$/.test(formData.newContact)) {
      newErrors.newContact = "Số liên hệ phải có đúng 10 chữ số";
    }

    // Validate quantity (required, positive integer)
    if (!formData.newQuantity) {
      newErrors.newQuantity = "Số lượng không được để trống";
    } else {
      const quantity = parseInt(formData.newQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.newQuantity = "Số lượng phải là số nguyên dương";
      } else if (quantity > 50) {
        newErrors.newQuantity = "Số lượng không được vượt quá 50 thành viên";
      }
    }

    // Validate avatar (required)
    if (!formData.newAvatar) {
      newErrors.newAvatar = "Vui lòng chọn ảnh đại diện";
    } else {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(formData.newAvatar.type)) {
        newErrors.newAvatar = "Chỉ cho phép file ảnh định dạng JPG, PNG, GIF";
      } else if (formData.newAvatar.size > 5 * 1024 * 1024) { // 5MB
        newErrors.newAvatar = "Kích thước ảnh không được vượt quá 5MB";
      }
    }

    // Validate sport type (required, must be valid)
    if (!formData.newSporttypeid) {
      newErrors.newSporttypeid = "Vui lòng chọn môn thể thao";
    } else {
      const validSportTypes = sporttypeList.map(spt => spt.sporttypeid);
      if (!validSportTypes.includes(formData.newSporttypeid)) {
        newErrors.newSporttypeid = "Môn thể thao không hợp lệ";
      }
    }

    // Validate descriptions (max 1000 characters, optional)
    if (formData.newDescriptions && formData.newDescriptions.length > 1000) {
      newErrors.newDescriptions = "Mô tả không được vượt quá 1000 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // filter
  const handleFilter = (sporttypeid: string | null) => {
    // Nếu đang ở chế độ My Team, không cho phép filter
    if (showMyTeamsOnly) {
      addNotification("Vui lòng chuyển về chế độ 'Tất cả đội' để sử dụng bộ lọc", "warning");
      return;
    }

    if (sporttypeid) {
      // Lọc từ allTeams theo sport type
      const filteredTeams = allTeams.filter(team => {
        const sportType = sporttypeList.find(spt => spt.categoryname === team.sport);
        return sportType && sportType.sporttypeid === sporttypeid;
      });
      setTeams(filteredTeams);
    } else {
      // Hiển thị tất cả teams
      setTeams(allTeams);
    }
  };

  // --- Submit create team ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("newNameteam", formData.newNameteam);
    if (formData.newAvatar) data.append("newAvatar", formData.newAvatar);
    data.append("newContact", formData.newContact);
    data.append("newQuantity", formData.newQuantity);
    data.append("newSporttypeid", formData.newSporttypeid);
    data.append("newDescriptions", formData.newDescriptions);

    try {
      const res = await fetch(`${URL_BACKEND}/api/user/team/createTeam`, {
        method: "POST",
        body: data,
        credentials: "include",
      });
      const result = await res.json();

      if (result.success) {
        // Hiển thị message từ API hoặc message mặc định
        const successMessage = result.message || `Đã tạo đội ${formData.newNameteam} thành công`;
        alert(successMessage);
        addNotification(successMessage, "success");
        setShowModal(false);
        fetchTeams(); // Reload
      } else {
        // Hiển thị message lỗi từ API
        const errorMessage = result.message || "Tạo đội thất bại";
        alert(errorMessage);
        addNotification(errorMessage, "error");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Đã xảy ra lỗi khi tạo đội";
      alert(errorMessage);
      addNotification(errorMessage, "error");
    }
  };

  // --- Fetch teams ---
  const parseTeamArray = (arr: any[]): TeamItem => {
    const id = Number(arr[0]) || 0;
    return {
      id,
      name: String(arr[2] ?? arr[1] ?? ""),
      quantity: Number(arr[3] ?? 0),
      avatar: String(arr[4] ?? ""),
      contact: String(arr[5] ?? ""),
      description: String(arr[6] ?? ""),
      createdDate: String(arr[8] ?? ""),
      sport: String(arr[9] ?? ""),
      maxQuantity: Number(arr[10] ?? 0),
      leader: String(arr[11] ?? arr[7] ?? ""),
    };
  };

  // Parse team array specifically for teamUser data structure
  const parseMyTeamArray = (arr: any[]): TeamItem => {
    // teamUser structure: [id, sporttypeid, name, quantity, avatar, contact, description, leader, createdDate, sport, maxQuantity, leaderFirstName, leaderLastName]
    const id = Number(arr[0]) || 0;
    return {
      id,
      name: String(arr[2] ?? ""),
      quantity: Number(arr[3] ?? 0),
      avatar: String(arr[4] ?? ""),
      contact: String(arr[5] ?? ""),
      description: String(arr[6] ?? ""),
      leader: String(arr[7] ?? ""),
      createdDate: String(arr[8] ?? ""),
      sport: String(arr[9] ?? ""),
      maxQuantity: Number(arr[10] ?? 0),
    };
  };

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${URL_BACKEND}/api/user/team`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      // Parse all teams
      let rawTeams: any[] = [];
      if (data?.teams?.content && Array.isArray(data.teams.content)) rawTeams = data.teams.content;
      else if (data?.teams && Array.isArray(data.teams)) rawTeams = data.teams;
      else if (Array.isArray(data)) rawTeams = data;

      const parsedAllTeams = rawTeams.map(parseTeamArray);

      // Parse my teams từ teamUser
      let rawMyTeams: any[] = [];
      if (data?.teamUser && Array.isArray(data.teamUser)) {
        rawMyTeams = data.teamUser;
      }

      const parsedMyTeams = rawMyTeams.map(parseMyTeamArray);

      // Lưu vào state
      setAllTeams(parsedAllTeams);
      setMyTeams(parsedMyTeams);

      // Hiển thị teams dựa trên mode hiện tại
      if (showMyTeamsOnly) {
        setTeams(parsedMyTeams);
      } else {
        setTeams(parsedAllTeams);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi khi tải dữ liệu");
      setTeams([]);
      setAllTeams([]);
      setMyTeams([]);
    } finally {
      setLoading(false);
    }
  };



  const handleToggleMyTeams = () => {
    setShowMyTeamsOnly(!showMyTeamsOnly);
    if (!showMyTeamsOnly) {
      // Switching to My Teams - hiển thị myTeams đã lưu
      setTeams(myTeams);
    } else {
      // Switching back to All Teams - hiển thị allTeams đã lưu
      setTeams(allTeams);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Nếu đang ở chế độ My Team, không cho phép search
    if (showMyTeamsOnly) {
      addNotification("Vui lòng chuyển về chế độ 'Tất cả đội' để sử dụng tìm kiếm", "warning");
      return;
    }

    if (searchText.trim()) {
      // Tìm kiếm trong allTeams theo tên
      const filteredTeams = allTeams.filter(team =>
        team.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setTeams(filteredTeams);
    } else {
      // Nếu không có text search, hiển thị tất cả
      setTeams(allTeams);
    }
  };


  // --- Render ---
  return (
    <>
      <HeroSection
        backgroundImage="/user/images/bg-team.png"
        title="Đội/Nhóm"
        breadcrumbs={[
          { label: "Trang Chủ", href: "/sportify" },
          { label: "Đội/Nhóm", href: "/sportify/team" }
        ]}
      />
      <section className="ftco-section">
        <div className="container">
          <div className="row">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="mb-0 d-flex justify-content-center col-md-12">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                name="searchText"
                className="form-control me-2 col-6"
                type="search"
                placeholder="Tìm kiếm theo tên"
                aria-label="Search"
                disabled={showMyTeamsOnly}
              />
              <button
                className="btn btn-success col-2"
                type="submit"
                disabled={showMyTeamsOnly}
              >
                Search
              </button>
            </form>

            {/* Current Mode Message */}
            <div className="d-flex justify-content-center col-md-12 mt-1">
              <div className="mr-4 col-md-8">
                {showMyTeamsOnly && (
                  <div className="alert alert-info text-center" role="alert">
                    <i className="fa fa-info-circle mr-2"></i>
                    Đang hiển thị các đội bạn tham gia. Tìm kiếm và lọc không khả dụng trong chế độ này.
                  </div>
                )}
              </div>
            </div>

            <div className="row col-md-12 ml-5 mt-4">
              <div className="row col-md-12 mb-1">
                <div className="col-md-12 d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="product-select">Lọc theo môn thể thao</h4>
                    <div className="dropdown filter">
                      <button
                        className={`btn dropdown-toggle col-md-8 mb-3 ${showMyTeamsOnly ? 'btn-secondary' : 'btn-success'}`}
                        type="button"
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        disabled={showMyTeamsOnly}
                      >
                        Lọc
                      </button>
                      <div className="dropdown-menu filter-item" aria-labelledby="dropdownMenuButton">
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => handleFilter(null)}
                        >
                          Tất cả
                        </button>
                        {sporttypeList.map((spt) => (
                          <button
                            key={spt.sporttypeid}
                            type="button"
                            className="dropdown-item"
                            onClick={() => handleFilter(spt.sporttypeid)}
                          >
                            {spt.categoryname}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex">
                    <button
                      className={`btn ${showMyTeamsOnly ? 'btn-secondary' : 'btn-outline-secondary'} col-auto pt-2 pb-2 mr-2`}
                      type="button"
                      onClick={handleToggleMyTeams}
                    >
                      {showMyTeamsOnly ? 'Tất cả đội' : 'My Team'}
                    </button>
                    <button className="btn btn-success col-auto pt-2 pb-2"
                      type="button"
                      onClick={() => setShowModal(true)}>
                      Tạo đội
                    </button>
                  </div>
                </div>
              </div>

              {/* No Results Message */}
              <div className="col-md-12">
                {!loading && !error && teams.length === 0 && <div className="text-muted">Không có đội nào.</div>}
                {error && <div className="text-danger">{error}</div>}
              </div>

              {/* Create Team Modal */}
              {showModal && (
                <div className="col-12 addteam" id="createModal">
                  <div className="col-6" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Điền thông tin để tạo nhóm.</h5>
                        <button type="button" className="close" onClick={() => setShowModal(false)}>
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <form className="row" onSubmit={handleSubmit}>
                          <div className="col-md-6 form-group">
                            <label>Tên nhóm:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="newNameteam"
                              value={formData.newNameteam}
                              onChange={handleChange}
                            />
                            {errors.newNameteam && <div className="error-message text-danger">{errors.newNameteam}</div>}
                          </div>
                          <div className="col-md-6 form-group">
                            <label>Ảnh đại diện:</label>
                            <input
                              type="file"
                              className="form-control"
                              name="newAvatar"
                              onChange={handleFileChange}
                            />
                            {errors.newAvatar && <div className="error-message text-danger">{errors.newAvatar}</div>}
                          </div>
                          <div className="col-md-6 form-group">
                            <label>Số liên hệ:</label>
                            <input
                              type="text"
                              className="form-control"
                              name="newContact"
                              value={formData.newContact}
                              onChange={handleChange}
                            />
                            {errors.newContact && <div className="error-message text-danger">{errors.newContact}</div>}
                          </div>
                          <div className="col-md-6 form-group">
                            <label>Số Lượng:</label>
                            <input
                              type="number"
                              className="form-control"
                              name="newQuantity"
                              value={formData.newQuantity}
                              onChange={handleChange}
                            />
                            {errors.newQuantity && <div className="error-message text-danger">{errors.newQuantity}</div>}
                          </div>
                          <div className="form-group col-md-6">
                            <label>Môn thể thao:</label>
                            <select
                              style={{ width: '100%' }}
                              className="custom-select form-control"
                              name="newSporttypeid"
                              value={formData.newSporttypeid}
                              onChange={handleChange}
                            >
                              {sporttypeList.map((spt) => (
                                <option key={spt.sporttypeid} value={spt.sporttypeid}>
                                  {spt.categoryname}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 form-group">
                            <label>Mô tả:</label>
                            <textarea
                              className="form-control"
                              name="newDescriptions"
                              rows={4}
                              value={formData.newDescriptions}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-12 modal-footer">
                            <button type="submit" className="btn btn-primary">Tạo</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Teams Grid */}
              <div className="col-md-12 row d-flex">
                {loading && <div className="text-center">Đang tải...</div>}
                {!loading && teams.map(team => (
                  <div key={team.id} className="col-lg-6 d-flex align-items-stretch">
                    <div className="blog-entry d-md-flex">
                      <img
                        className="block-20 img bg-dark block-19"
                        src={team.avatar ? getImageUrl(team.avatar) : "/user/images/default.png"}
                        alt=""
                      />
                      <div className="text p-4 bg-light d-flex flex-column">
                        <h3 className="heading mb-3" style={{ color: '#2E7D32', fontWeight: 'bold' }}>
                          <a href="#">{team.name}</a>
                        </h3>
                        <div className="d-flex">
                          <p className="lable_team">Ngày lập :</p>
                          <div className="meta">
                            <p className="fa fa-calendar"></p>
                            <span>{team.createdDate}</span>
                          </div>
                        </div>
                        <div className="d-flex">
                          <p className="lable_team">Thành viên :</p>
                          <p style={{ marginRight: '5px' }}>{team.quantity}</p>
                          <p style={{ marginRight: '5px' }}>/</p>
                          <p style={{ marginRight: '5px' }}>{team.maxQuantity}</p>
                        </div>
                        <div className="d-flex">
                          <p className="lable_team">Môn thể thao :</p>
                          <p>{team.sport}</p>
                        </div>
                        <div className="d-flex">
                          <p className="lable_team">Đội trưởng :</p>
                          <p>{team.leader}</p>
                        </div>
                        <div className="d-flex">
                          <p className="limited-length" style={{ fontStyle: 'italic' }}>
                            {team.description}
                          </p>
                        </div>
                        <div className="submit-section align-self-end mt-auto">
                          <button
                            className="btn btn-success"
                            onClick={() => handleEnterTeam(team)}
                          >
                            Vào Team
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};



export default TeamPage;
