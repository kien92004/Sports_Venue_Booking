const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface TeamMember {
  teamdetailid: number;
  teamid: number;
  username: string;
  joindate: string;
  infouser: string;
  status: boolean;
}

const TeamDetailPage: React.FC = () => {
  const { teamid } = useParams<{ teamid: string }>();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchName, setSearchName] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (teamid) {
      fetch(`${URL_BACKEND}/rest/teams/${teamid}`)
        .then(res => res.json())
        .then(data => setTeamMembers(data));
    }
  }, [teamid]);

  useEffect(() => {
    if (searchName) {
      setFilteredMembers(
        teamMembers.filter(m =>
          m.username.toLowerCase().includes(searchName.toLowerCase())
        )
      );
    } else {
      setFilteredMembers(teamMembers);
    }
  }, [searchName, teamMembers]);

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div className=" page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Chi tiết thành viên đội</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item"><a href="/admin/teams">Đội thể thao</a></li>
                <li className="breadcrumb-item active" aria-current="page">Thành viên đội</li>
              </ol>
            </nav>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tên thành viên"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
          </div>
        </form>
        {/* /Search Filter */}

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Tên thành viên</th>
                    <th>Ngày tham gia</th>
                    <th>Thông tin</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((item, idx) => (
                    <tr key={item.teamdetailid}>
                      <td>{idx + 1}</td>
                      <td>{item.username}</td>
                      <td>{formatDate(item.joindate)}</td>
                      <td>{item.infouser}</td>
                      <td>{item.status ? "Đang hoạt động" : "Ngưng hoạt động"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMembers.length === 0 && (
                <div className="text-center text-muted py-4">Không có thành viên nào.</div>
              )}
            </div>
          </div>
        </div>
        {/* Toast/Notification */}
        <div id="toast"></div>
      </div>
    </div>
  );
};

export default TeamDetailPage;
