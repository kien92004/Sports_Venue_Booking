import React, { useEffect, useState, useMemo } from "react";
import { fetchFootballPrediction } from '../../../service/user/home/footballPredictionApi';
import "../../../styles/FootballPredictionPage.css"
import HeroSection from "../../../components/user/Hero";

type Match = {
  id: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  competition: string;
  venue: string;
  status: string;
  predictedScore?: string;
  aiConfidence?: number;
  aiAnalysis?: string;
  recommendation?: string;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
};

type ApiStatus = {
  season?: string;
  competition?: string;
  message: string;
  status: string;
};

type ApiResponse = {
  apiInfo?: string;
  apiStatus?: ApiStatus;
  upcomingMatches?: Match[];
};

const defaultTeamLogo = "/user/images/team-default.png";

const FootballPredictionPage: React.FC = () => {
  const [data, setData] = useState<ApiResponse>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 12;
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [modalMatch, setModalMatch] = useState<Match | null>(null);

  useEffect(() => {
    fetchFootballPrediction()
      .then((d) => setData(d))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  // Autocomplete team names
  const allTeams = useMemo(() => {
    const teams = new Set<string>();
    data.upcomingMatches?.forEach((m) => {
      teams.add(m.homeTeam);
      teams.add(m.awayTeam);
    });
    return Array.from(teams);
  }, [data.upcomingMatches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    let matches = data.upcomingMatches || [];
    // Search
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      matches = matches.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(s) ||
          m.awayTeam.toLowerCase().includes(s)
      );
    }
    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      matches = matches.filter((m) => {
        const matchDate = new Date(m.date);
        if (dateFilter === "today") {
          return matchDate.toDateString() === today.toDateString();
        }
        if (dateFilter === "tomorrow") {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return matchDate.toDateString() === tomorrow.toDateString();
        }
        if (dateFilter === "week") {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          return matchDate >= today && matchDate <= weekFromNow;
        }
        if (dateFilter === "custom" && customDate) {
          const sel = new Date(customDate);
          return (
            matchDate.getFullYear() === sel.getFullYear() &&
            matchDate.getMonth() === sel.getMonth() &&
            matchDate.getDate() === sel.getDate()
          );
        }
        return true;
      });
    }
    return matches;
  }, [data.upcomingMatches, search, dateFilter, customDate]);

  // Pagination
  const totalMatches = filteredMatches.length;
  const totalPages = Math.ceil(totalMatches / matchesPerPage);
  const pagedMatches = filteredMatches.slice(
    (currentPage - 1) * matchesPerPage,
    currentPage * matchesPerPage
  );

  // Autocomplete logic
  useEffect(() => {
    if (search.length >= 2) {
      setSuggestions(
        allTeams.filter((t) =>
          t.toLowerCase().includes(search.trim().toLowerCase())
        ).slice(0, 8)
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
    setSelectedSuggestion(-1);
  }, [search, allTeams]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleDateFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFilter(e.target.value);
    if (e.target.value !== "custom") setCustomDate("");
  };
  const handleCustomDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDate(e.target.value);
  };
  const handleSuggestionClick = (team: string) => {
    setSearch(team);
    setShowSuggestions(false);
  };
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      setSelectedSuggestion((s) => Math.min(s + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedSuggestion((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && selectedSuggestion >= 0) {
      setSearch(suggestions[selectedSuggestion]);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };


  // Pagination
  const changePage = (delta: number) => {
    setCurrentPage((p) => Math.max(1, Math.min(totalPages, p + delta)));
  };

  // Show match details (modal with detailed analysis)
  const showMatchDetails = (id: number) => {
    const match = (data.upcomingMatches || []).find((m) => m.id === id);
    setModalMatch(match || null);
  };

  // Modal close handler
  const closeModal = () => setModalMatch(null);

  return (
    <div>
      <HeroSection
        backgroundImage="/user/images/event3.png"
        title="Dự đoán kết quả"
        breadcrumbs={[
          { label: "Trang Chủ", href: "/sportify" },
          { label: "Dự đoán kết quả" }
        ]}
      />

      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center pb-5 mb-3">
            <div className="col-md-8 text-center heading-section">
              <h2 className="mb-4">Dự đoán kết quả trận đấu</h2>
              <p>Sử dụng AI và dữ liệu thống kê để dự đoán kết quả các trận đấu bóng đá</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card search-filter-card">
                <div className="card-body">
                  <form className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fa fa-search mr-2"></i>Tìm kiếm đội bóng
                        </label>
                        <div className="autocomplete-container">
                          <input
                            type="text"
                            id="searchInput"
                            className="form-control"
                            placeholder="Nhập tên đội bóng..."
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                          />
                          {showSuggestions && suggestions.length > 0 && (
                            <div className="suggestions-dropdown" id="suggestions" style={{ display: 'block' }}>
                              {suggestions.map((team, idx) => (
                                <div
                                  key={idx}
                                  className={`suggestion-item ${idx === selectedSuggestion ? 'selected' : ''}`}
                                  onClick={() => handleSuggestionClick(team)}
                                >
                                  <span className="team-name">{team}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fa fa-calendar mr-2"></i>Lọc theo ngày
                        </label>
                        <select
                          id="dateFilter"
                          className="form-control"
                          value={dateFilter}
                          onChange={handleDateFilter}
                        >
                          <option value="all">Tất cả</option>
                          <option value="today">Hôm nay</option>
                          <option value="tomorrow">Ngày mai</option>
                          <option value="week">Tuần này</option>
                          <option value="custom">Tùy chọn</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      {dateFilter === "custom" && (
                        <div className="form-group" id="customDateGroup">
                          <label className="form-label">Chọn ngày</label>
                          <div className="input-group">
                            <input
                              type="date"
                              id="customDate"
                              className="form-control"
                              value={customDate}
                              onChange={handleCustomDate}
                            />
                            <div className="input-group-append">
                              <button 
                                type="button" 
                                className="btn btn-outline-secondary"
                                onClick={() => setCustomDate("")}
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-2">
                      <button 
                        type="button" 
                        className="btn btn-primary w-100"
                        onClick={() => {
                          setSearch("");
                          setDateFilter("all");
                          setCustomDate("");
                        }}
                      >
                        <i className="fa fa-refresh mr-2"></i>Reset
                      </button>
                    </div>
                  </form>
                  <div className="row mt-3">
                    <div className="col text-center">
                      <small className="text-muted">
                        <i className="fa fa-info-circle mr-1"></i>
                        Tìm thấy {filteredMatches.length} trận đấu
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matches Container */}
          <div className="row" id="matchesContainer">
            {loading && (
              <div className="col-12">
                <div className="alert alert-info text-center">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary mr-3" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <div>
                      <h4 className="mb-1">Đang tải dữ liệu trận đấu...</h4>
                      <p className="mb-0">Hệ thống đang kết nối với Football-Data.org API để lấy dữ liệu mới nhất</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!loading && pagedMatches.length === 0 && (
              <div className="col-12">
                <div className="alert alert-warning text-center">
                  <h5>
                    <i className="fa fa-search mr-2"></i>Không tìm thấy trận đấu nào
                  </h5>
                  <p>
                    Không có kết quả cho "{search}"{" "}
                    {dateFilter !== "all" && (
                      <span>
                        với bộ lọc{" "}
                        {dateFilter === "today"
                          ? "hôm nay"
                          : dateFilter === "tomorrow"
                          ? "ngày mai"
                          : dateFilter === "week"
                          ? "tuần này"
                          : `ngày ${customDate}`}
                      </span>
                    )}
                  </p>
                  <p>
                    <small>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc khác</small>
                  </p>
                </div>
              </div>
            )}
            {pagedMatches.map((match) => (
              <div
                key={match.id}
                className="col-md-6 col-lg-4 match-item mb-4"
                data-home-team={match.homeTeam}
                data-away-team={match.awayTeam}
                data-date={match.date}
                data-confidence={match.aiConfidence || 0}
              >
                <div className="match-card h-100">
                  <div className="match-header text-center mb-3">
                    <small className="text-info font-weight-bold">{match.competition}</small>
                    <br />
                    <small className="text-muted">
                      <i className="fa fa-clock-o mr-1"></i>
                      {match.time} - {new Date(match.date).toLocaleDateString("vi-VN")}
                    </small>
                  </div>
                  
                  <div className="teams-container">
                    <div className="row align-items-center">
                      <div className="col-4 text-center">
                        <img
                          src={match.homeTeamLogo || defaultTeamLogo}
                          alt={match.homeTeam}
                          className="team-logo mb-2"
                          onError={(e) => {
                            e.currentTarget.src = defaultTeamLogo;
                          }}
                        />
                        <h6 className="team-name mb-0">{match.homeTeam}</h6>
                      </div>
                      
                      <div className="col-4 text-center">
                        <div className="vs-section">
                          <h4 className="vs-text mb-2">VS</h4>
                          {match.predictedScore && (
                            <div className="prediction-score mb-2">
                              <span className="badge badge-success">
                                <i className="fa fa-trophy mr-1"></i>
                                AI: {match.predictedScore}
                              </span>
                            </div>
                          )}
                          {match.aiConfidence && (
                            <div className="confidence-level">
                              <small className="text-muted">
                                Độ tin cậy: {match.aiConfidence}%
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-4 text-center">
                        <img
                          src={match.awayTeamLogo || defaultTeamLogo}
                          alt={match.awayTeam}
                          className="team-logo mb-2"
                          onError={(e) => {
                            e.currentTarget.src = defaultTeamLogo;
                          }}
                        />
                        <h6 className="team-name mb-0">{match.awayTeam}</h6>
                      </div>
                    </div>
                  </div>
                  
                  <div className="probabilities mt-3">
                    <div className="row text-center">
                      <div className="col-4">
                        <span className="badge badge-primary d-block mb-1">
                          {match.homeWinProbability}%
                        </span>
                        <small className="text-muted">Thắng</small>
                      </div>
                      <div className="col-4">
                        <span className="badge badge-secondary d-block mb-1">
                          {match.drawProbability}%
                        </span>
                        <small className="text-muted">Hòa</small>
                      </div>
                      <div className="col-4">
                        <span className="badge badge-primary d-block mb-1">
                          {match.awayWinProbability}%
                        </span>
                        <small className="text-muted">Thắng</small>
                      </div>
                    </div>
                  </div>
                  
                  {match.aiAnalysis && (
                    <div className="ai-analysis mt-3">
                      <small className="text-muted">
                        <i className="fa fa-brain mr-1"></i>
                        {match.aiAnalysis}
                      </small>
                    </div>
                  )}
                  
                  {match.recommendation && (
                    <div className="recommendation mt-2">
                      <small className="text-info">
                        <i className="fa fa-lightbulb-o mr-1"></i>
                        {match.recommendation}
                      </small>
                    </div>
                  )}
                  
                  <div className="action-buttons text-center mt-3">
                    <button
                      className="prediction-btn"
                      onClick={() => showMatchDetails(match.id)}
                    >
                      <i className="fa fa-chart-line mr-2"></i>
                      Chi tiết phân tích
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="row mt-4" id="paginationContainer">
              <div className="col-12 text-center">
                <nav aria-label="Match pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => changePage(-1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fa fa-chevron-left"></i> Trước
                      </button>
                    </li>
                    <li className="page-item active">
                      <span className="page-link">
                        Trang {currentPage} / {totalPages}
                      </span>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => changePage(1)}
                        disabled={currentPage === totalPages}
                      >
                        Sau <i className="fa fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
                <small className="text-muted d-block mt-2">
                  Hiển thị {(currentPage - 1) * matchesPerPage + 1} -{" "}
                  {Math.min(currentPage * matchesPerPage, totalMatches)} trong tổng số{" "}
                  {totalMatches} trận đấu
                </small>
              </div>
            </div>
          )}

          {/* API Info */}
          {data.apiInfo && (
            <div className="row mt-5">
              <div className="col-12">
                <div className="alert alert-success text-center">
                  <h5 className="mb-3">
                    <i className="fa fa-check-circle mr-2"></i>
                    Football-Data.org API + AI Engine Hoạt Động!
                  </h5>
                  <p className="mb-3">{data.apiInfo}</p>
                  <div className="row">
                    <div className="col-md-6 col-lg-3 mb-2">
                      <small>
                        <i className="fa fa-database mr-1 text-primary"></i>
                        <strong>Real-time data:</strong> Dữ liệu trận đấu được cập nhật liên tục
                      </small>
                    </div>
                    <div className="col-md-6 col-lg-3 mb-2">
                      <small>
                        <i className="fa fa-brain mr-1 text-success"></i>
                        <strong>AI Predictions:</strong> Sử dụng machine learning để dự đoán
                      </small>
                    </div>
                    <div className="col-md-6 col-lg-3 mb-2">
                      <small>
                        <i className="fa fa-chart-bar mr-1 text-info"></i>
                        <strong>Statistical Analysis:</strong> Phân tích dựa trên lịch sử đối đầu
                      </small>
                    </div>
                    <div className="col-md-6 col-lg-3 mb-2">
                      <small>
                        <i className="fa fa-refresh mr-1 text-warning"></i>
                        <strong>Live Updates:</strong> Cập nhật trạng thái trận đấu theo thời gian thực
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Status Section */}
          <div className="row mt-4">
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100 border-0 shadow-sm">
                <div className="card-body d-flex flex-column justify-content-center">
                  <i className="fa fa-server fa-3x text-success mb-3"></i>
                  <h6 className="font-weight-bold">Football-Data.org API</h6>
                  <small className="text-success">
                    <i className="fa fa-check-circle mr-1"></i>
                    Tích hợp hoàn tất
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100 border-0 shadow-sm">
                <div className="card-body d-flex flex-column justify-content-center">
                  <i className="fa fa-brain fa-3x text-success mb-3"></i>
                  <h6 className="font-weight-bold">AI Prediction Engine</h6>
                  <small className="text-success">
                    <i className="fa fa-check-circle mr-1"></i>
                    Đang hoạt động
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100 border-0 shadow-sm">
                <div className="card-body d-flex flex-column justify-content-center">
                  <i className="fa fa-chart-line fa-3x text-success mb-3"></i>
                  <h6 className="font-weight-bold">Match Analysis</h6>
                  <small className="text-success">
                    <i className="fa fa-check-circle mr-1"></i>
                    Real-time predictions
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Match Details Modal */}
      {modalMatch && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fa fa-chart-line mr-2"></i>
                  Phân tích chi tiết: {modalMatch.homeTeam} vs {modalMatch.awayTeam}
                </h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {/* Match Info */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="font-weight-bold"><i className="fa fa-calendar mr-2"></i>Thông tin trận đấu</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item px-0 py-1"><strong>Ngày:</strong> {modalMatch.date}</li>
                      <li className="list-group-item px-0 py-1"><strong>Giờ:</strong> {modalMatch.time}</li>
                      <li className="list-group-item px-0 py-1"><strong>Giải đấu:</strong> {modalMatch.competition}</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="font-weight-bold"><i className="fa fa-trophy mr-2"></i>Dự đoán AI</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item px-0 py-1">
                        <strong>Tỷ số dự đoán:</strong>{" "}
                        <span className="badge bg-success">{modalMatch.predictedScore}</span>
                      </li>
                      <li className="list-group-item px-0 py-1">
                        <strong>Độ tin cậy:</strong>{" "}
                        <span className="badge bg-info">{modalMatch.aiConfidence}%</span>
                      </li>
                      <li className="list-group-item px-0 py-1">
                        <strong>Khuyến nghị:</strong> {modalMatch.recommendation}
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Probabilities */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="font-weight-bold"><i className="fa fa-percentage mr-2"></i>Xác suất kết quả</h6>
                    <div className="progress mb-2" style={{ height: 28 }}>
                      <div className="progress-bar bg-success font-weight-bold" style={{ width: `${modalMatch.homeWinProbability}%` }}>
                        {modalMatch.homeWinProbability}% Thắng
                      </div>
                    </div>
                    <div className="progress mb-2" style={{ height: 28 }}>
                      <div className="progress-bar bg-warning text-dark font-weight-bold" style={{ width: `${modalMatch.drawProbability}%` }}>
                        {modalMatch.drawProbability}% Hòa
                      </div>
                    </div>
                    <div className="progress mb-2" style={{ height: 28 }}>
                      <div className="progress-bar bg-info font-weight-bold" style={{ width: `${modalMatch.awayWinProbability}%` }}>
                        {modalMatch.awayWinProbability}% Thắng
                      </div>
                    </div>
                  </div>
                </div>
                {/* AI Analysis */}
                <div className="row mt-3">
                  <div className="col-12">
                    <h6 className="font-weight-bold"><i className="fa fa-brain mr-2"></i>Phân tích AI</h6>
                    <div className="alert alert-info">
                      <p className="mb-1"><strong>{modalMatch.aiAnalysis}</strong></p>
                      <p className="mb-0"><strong>Khuyến nghị:</strong> {modalMatch.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ...existing code for footer nếu dùng Layout... */}
    </div>
  );
};



export default FootballPredictionPage;
