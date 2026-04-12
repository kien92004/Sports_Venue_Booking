import axios from "axios";
import { type FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeroSection from "../../../components/user/Hero";
import getImageUrl from "../../../helper/getImageUrl";
import { useNotification } from "../../../helper/NotificationContext";
import GroupChat from "./GroupChat";

// Types based on the API response structure
type WaitingListItem = {
	teamdetailid: number;
	teamid: number;
	username: string;
	joindate: string;
	infouser: string | null;
	status: boolean;
};

type SportType = {
	sporttypeid: string;
	categoryname: string;
};

type User = {
	username: string;
	passwords: string;
	firstname: string;
	lastname: string;
	phone: string;
	email: string;
	address: string;
	image: string;
	gender: boolean;
	status: boolean;
};

type TeamInfo = {
	teamid: number;
	sporttypeid: string;
	nameteam: string;
	quantity: number;
	avatar: string;
	contact: string;
	descriptions: string;
	username: string;
	createdate: string;
	sporttype: SportType;
	users: User;
};

type MemberData = [
	string, // username
	string, // password (not used)
	string, // firstname
	string, // lastname
	string, // phone
	string, // email
	string, // address
	string, // image
	boolean, // gender
	boolean, // status
	number, // teamdetailid
	number, // teamid
	string, // joindate
	string | null // infouser
];

type TeamDetailResponse = {
	waitingList: WaitingListItem[];
	teamInfo: TeamInfo;
	listMember: MemberData[];
	teamId: number;
	message: string;
	role: string;
	permissions: string[];
	success: boolean;
};

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
const TeamDetail: FC<{ teamIdProp?: string }> = ({ teamIdProp }) => {
	const params = useParams<{ teamId?: string }>();
	const navigate = useNavigate();
	const teamId = teamIdProp ?? params.teamId ?? "";
	const { addNotification } = useNotification();

	// States
	const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
	const [listMember, setListMember] = useState<MemberData[]>([]);
	const [waitingList, setWaitingList] = useState<WaitingListItem[]>([]);
	const [role, setRole] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTeamDetail = async () => {
		if (!teamId) {
			setError("No teamId provided");
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			const response = await axios.get(`${URL_BACKEND}/api/user/team/teamdetail/${teamId}`, {
				withCredentials: true
			});

			const data: TeamDetailResponse = response.data;

			if (data.success) {
				setTeamInfo(data.teamInfo);
				setListMember(data.listMember);
				setWaitingList(data.waitingList);
				setRole(data.role);
			} else {
				setError(data.message || "Failed to fetch team details");
			}
		} catch (err: any) {
			setError(err.response?.data?.message || err.message || "Fetch error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTeamDetail();
	}, [teamId]);

	// Handler functions
	const handleExit = async () => {
		const confirmMessage = role === "owner" ? "Bạn có chắc chắn muốn giải tán đội?" : "Bạn có chắc chắn muốn rời khỏi đội?";
		if (!confirm(confirmMessage)) return;

		try {
			const response = await axios.get(`${URL_BACKEND}/api/user/team/teamdetail/${teamId}/exit`, {
				withCredentials: true
			});

			if (response.data.success) {
				const message = role === "owner" ? "Bạn đã giải tán đội thành công" : "Bạn đã rời khỏi đội thành công";
				addNotification(message, "success");
				navigate('/team');
			} else {
				addNotification(response.data.message, "error");
			}
		} catch (error: any) {
			addNotification(error.response?.data?.message || "Có lỗi xảy ra", "error");
		}
	};

	const handleAccept = async (username: string) => {
		try {
			const response = await axios.post(
				`${URL_BACKEND}/api/user/team/teamdetail/xacnhan`,
				{
					teamId: parseInt(teamId),
					username: username
				},
				{ withCredentials: true }
			);

			if (response.data.success) {
				addNotification(`Đã chấp nhận ${username} vào đội`, "success");
				fetchTeamDetail();
			} else {
				addNotification(response.data.message, "error");
			}
		} catch (error: any) {
			addNotification(error.response?.data?.message || "Có lỗi xảy ra khi xác nhận thành viên", "error");
		}
	};

	const handleReject = async (username: string) => {
		try {
			const response = await axios.post(
				`${URL_BACKEND}/api/user/team/teamdetail/tuchoi`,
				{
					teamId: parseInt(teamId),
					username: username
				},
				{ withCredentials: true }
			);

			if (response.data.success) {
				addNotification(`Đã từ chối yêu cầu tham gia đội của ${username}`, "info");
				fetchTeamDetail();
			} else {
				addNotification(response.data.message, "error");
			}
		} catch (error: any) {
			addNotification(error.response?.data?.message || "Có lỗi xảy ra khi từ chối thành viên", "error");
		}
	};

	const handleKick = async (username: string) => {
		if (!confirm(`Bạn có chắc chắn muốn kick ${username} khỏi đội?`)) return;

		try {
			const response = await axios.post(
				`${URL_BACKEND}/api/user/team/teamdetail/kick`,
				{
					teamId: parseInt(teamId),
					username: username
				},
				{ withCredentials: true }
			);

			if (response.data.success) {
				addNotification(`Đã loại ${username} khỏi đội`, "success");
				fetchTeamDetail();
			} else {
				addNotification(response.data.message, "error");
			}
		} catch (error: any) {
			addNotification(error.response?.data?.message || "Có lỗi xảy ra khi kick thành viên", "error");
		}
	};

	const handleSetCaptain = async (username: string) => {
		if (!confirm(`Bạn có chắc chắn muốn phong ${username} làm đội trưởng?`)) return;

		try {
			const response = await axios.post(
				`${URL_BACKEND}/api/user/team/teamdetail/phongdoitruong`,
				{
					teamId: parseInt(teamId),
					username: username
				},
				{ withCredentials: true }
			);

			if (response.data.success) {
				addNotification(`Đã phong ${username} làm đội trưởng mới`, "success");
				fetchTeamDetail();
			} else {
				addNotification(response.data.message, "error");
			}
		} catch (error: any) {
			addNotification(error.response?.data?.message || "Có lỗi xảy ra khi phong đội trưởng", "error");
		}
	};

	if (loading) return <div className="flex justify-center items-center min-vh-100">Loading...</div>;
	if (error) return <div className="flex justify-center items-center min-vh-100 text-danger">{error}</div>;
	if (!teamInfo) return <div className="flex justify-center items-center min-vh-100">No team data</div>;

	return (
		<>
			<HeroSection
				backgroundImage="/user/images/bg-team.png"
				title="Chi tiết đội"
				breadcrumbs={[
					{ label: "Trang Chủ", href: "/sportify" },
					{ label: "Đội/Nhóm", href: "/sportify/team" },
					{ label: "Chi tiết đội" }
				]}
			/>
			<div className="container py-4">
				<div
					className="bg-white rounded-4 shadow-lg p-4"
					style={{ minHeight: 300 }}
				>
					<div className="row mb-4">
						{/* LEFT SIDE */}
						<div className="col-8">
							{/* Team Info */}
							<div data-teamdetail-left className="border-right pr-4">
								{/* Chủ sân */}
								<div className="border rounded-3 mb-4 p-3 bg-white">
									<h5 className="mb-3 fw-bold">
										<i className="fa fa-crown text-warning me-2"></i>
										Thông tin chủ sân
									</h5>
									<div className="d-flex align-items-center gap-3">
										<img
											src={teamInfo.users.image ? getImageUrl(teamInfo.users.image) : "/user/images/noavatar.jpg"}
											alt="avatar"
											className="rounded-circle border"
											style={{ width: 64, height: 64, objectFit: "cover" }}
										/>
										<div>
											<div className="fw-bold">{teamInfo.users.firstname} {teamInfo.users.lastname}</div>
											<div className="text-muted small">@{teamInfo.users.username}</div>
											<div className="badge bg-warning text-dark mt-1">Đội trưởng</div>
										</div>
									</div>
								</div>
								{/* 2 cột: Ảnh sân + Thông tin sân */}
								<div className="row g-2">
									<div className="col-5">
										<div className="p-2 h-100 d-flex flex-column align-items-center justify-content-center">
											<img
												src={teamInfo.avatar ? getImageUrl(teamInfo.avatar) : "/user/images/noavatar.jpg"}
												alt="avatar"
												style={{ width: 200, height: "auto", objectFit: "cover" }}
											/>
											<div className="fw-bold mt-2 text-center">{teamInfo.nameteam}</div>
										</div>
									</div>
									<div className="col-7">
										<div className="p-3 h-100">
											<div className="mb-2">
												<span className="fw-bold">Môn thể thao: </span>
												{teamInfo.sporttype.categoryname}
											</div>
											<div className="mb-2">
												<span className="fw-bold">Số lượng tối đa: </span>
												{teamInfo.quantity}
											</div>
											<div className="mb-2">
												<span className="fw-bold">Liên hệ: </span>
												{teamInfo.contact}
											</div>
											<div className="mb-2">
												<span className="fw-bold">Ngày tạo: </span>
												{new Date(teamInfo.createdate).toLocaleDateString('vi-VN')}
											</div>
											<div>
												<span className="fw-bold">Mô tả: </span>
												<span className="text-muted">{teamInfo.descriptions}</span>
											</div>
										</div>
									</div>
								</div>

								{/* GroupChat */}
								<div className="mt-4">
									<h5 className="mb-3 fw-bold">
										<i className="fa fa-comments me-2"></i>
										Chat nhóm
									</h5>
									<GroupChat />
								</div>
							</div>
						</div>
						{/* RIGHT SIDE */}
						<div className="col-4">
							{/* Danh sách thành viên */}
							<div className="mb-4 p-3 bg-white">
								<h5 className="fw-bold mb-3">
									<i className="fa fa-users me-2"></i>
									Danh sách Thành viên
								</h5>
								<div className="d-flex flex-column gap-2">
									{listMember.map((member, idx) => (
										<div
											key={idx}
											className="d-flex align-items-center border rounded-2 px-2 py-2 bg-light mb-2"
											style={{ minHeight: 48 }}
										>
											<img
												src={member[7] ? getImageUrl(member[7]) : "/user/images/noavatar.jpg"}
												alt="avatar"
												className="rounded-circle border"
												style={{ width: 40, height: 40, objectFit: "cover" }}
											/>
											<div className="ms-3 flex-grow-1">
												<div className="fw-semibold">{member[0]}</div>
											</div>
											{role === "owner" && member[0] !== teamInfo.username && (
												<div className="d-flex gap-2 align-items-center">
													<button
														className="btn btn-outline-danger btn-sm d-flex align-items-center px-2 py-1"
														style={{ minWidth: 36 }}
														title="Kích khỏi đội"
														onClick={() => handleKick(member[0])}
													>
														<i className="fa fa-user-times"></i>
													</button>
													<button
														className="btn btn-outline-primary btn-sm d-flex align-items-center px-2 py-1"
														style={{ minWidth: 36 }}
														title="Phong làm đội trưởng"
														onClick={() => handleSetCaptain(member[0])}
													>
														<i className="fa fa-star"></i>
													</button>
												</div>
											)}
											{member[0] === teamInfo.username && (
												<span className="badge bg-warning text-dark ms-2">Đội trưởng</span>
											)}
										</div>
									))}
								</div>
							</div>
							<hr style={{ border: '1px solid #eee' }} />
							{/* Danh sách chờ */}
							<h5 className="fw-bold mb-3">
								<i className="fa fa-hourglass-half me-2"></i>
								Danh sách chờ
							</h5>
							{role === "owner" && (
								Array.isArray(waitingList) ? (
									waitingList.length === 0 ? (
										<h6 className="text-center text-muted">
											Không có thành viên nào trong danh sách chờ
										</h6>
									) : (
										<div className="p-3 bg-white">
											<div className="d-flex flex-column gap-2">
												{waitingList.map((member, idx) => (
													<div
														key={idx}
														className="d-flex align-items-center border rounded-2 px-2 py-2 bg-light mb-2"
													>
														<img
															src="/user/images/noavatar.jpg"
															alt="avatar"
															className="rounded-circle border"
															style={{ width: 40, height: 40, objectFit: "cover" }}
														/>
														<div className="ms-3 flex-grow-1">
															<div className="fw-semibold">{member.username}</div>
														</div>
														<div className="d-flex gap-2 align-items-center">
															<button
																className="btn btn-outline-danger btn-sm d-flex align-items-center px-2 py-1"
																style={{ minWidth: 32 }}
																title="Từ chối"
																onClick={() => handleReject(member.username)}
															>
																<i className="fa fa-times"></i>
															</button>
															<button
																className="btn btn-outline-success btn-sm d-flex align-items-center px-2 py-1"
																style={{ minWidth: 32 }}
																title="Chấp nhận"
																onClick={() => handleAccept(member.username)}
															>
																<i className="fa fa-check"></i>
															</button>
														</div>
													</div>
												))}
											</div>
										</div>
									)
								) : (
									<h6 className="text-center text-danger">
										Dữ liệu danh sách chờ không hợp lệ
									</h6>
								)
							)}



						</div>
					</div>
					{/* Bottom Action */}
					<div className="row justify-content-end mt-4">
						<div className="col-2">
							<button
								onClick={handleExit}
								className={`btn ${role === "owner" ? "btn-danger" : "btn-warning"} w-100`}
							>
								<i className={`fa ${role === "owner" ? "fa-ban" : "fa-door-open"} me-2`}></i>
								{role === "owner" ? "Giải tán đội" : "Rời khỏi đội"}
							</button>
						</div>
					</div>
				</div>

			</div>
		</>
	);
};

export default TeamDetail;