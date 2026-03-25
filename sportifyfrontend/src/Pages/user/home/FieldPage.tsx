import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import HeroSection from "../../../components/user/Hero";
import Loader from "../../../components/user/Loader";
import NearestFieldFinder from "../../../components/user/NearestFieldFinder";
import getImageUrl from "../../../helper/getImageUrl";
import { fetchFieldList } from '../../../service/user/home/fieldApi';
import "../../../styles/FieldPage.css";
import "../../../styles/NearestFieldFinder.css";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type Category = {
  sporttypeid: string;
  categoryname: string;
};

type FieldOwner = {
  ownerId: number;
  businessName: string;
  phone?: string;
  address?: string;
  status?: string;
};

type FieldItem = {
  fieldid: number;
  sporttypeid: string;
  namefield: string;
  descriptionfield: string;
  price: number;
  image: string;
  address: string;
  status: boolean;
  sporttype?: Category;
  owner?: FieldOwner | null;
};

export default function FieldPage() {
  const [loading, setLoading] = useState(true);
  const [cates, setCates] = useState<Category[]>([]);
  const [fieldList, setFieldList] = useState<FieldItem[]>([]);
  const [fieldDistances, setFieldDistances] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("tatca");
  const [sortOrder, setSortOrder] = useState<"" | "asc" | "desc">("");

  const [searchOwner, setSearchOwner] = useState<string>("");
  const [searchAddress, setSearchAddress] = useState<string>("");

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const categoryParam = searchParams.get('categorySelect') || 'tatca';

    if (latitude && longitude) {
      setSelectedCategory(categoryParam);
      let validLatitude = parseFloat(latitude || "0");
      let validLongitude = Math.abs(parseFloat(longitude || "0"));

      if (validLatitude < 8 || validLatitude > 23 || validLongitude < 102 || validLongitude > 109) {
        console.log('Tọa độ nằm ngoài Việt Nam, sử dụng tọa độ mặc định TP.HCM');
        validLatitude = 10.7769;
        validLongitude = 106.7;
      }

      console.log('Đang gọi API với tọa độ đã kiểm tra:', validLatitude, validLongitude);

      // Thêm tham số maxDistance để mở rộng phạm vi tìm kiếm
      fetch(`${BACKEND_URL}/api/sportify/field/nearest?latitude=${validLatitude}&longitude=${validLongitude}&categorySelect=${categoryParam}&limit=50&maxDistance=25`)
        .then(response => {
          console.log('Trạng thái phản hồi:', response.status);
          if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Dữ liệu nhận được:', data);
          setCates(data.cates || []);
          setFieldList(data.fieldList || []);
          setFieldDistances(data.fieldDistances || {});

          if ((data.fieldList || []).length === 0) {
            console.log('Không tìm thấy sân nào gần vị trí của bạn. Hiển thị tất cả sân.');
            fetchFieldList()
              .then((allData) => {
                setCates(allData.cates || []);
                setFieldList(allData.fieldList || []);
                setError("Không tìm thấy sân gần vị trí của bạn. Đang hiển thị tất cả các sân có sẵn.");
              })
              .catch((err) => {
                console.error("Lỗi khi load danh sách sân backup:", err);
                setError("Không tìm thấy sân gần vị trí của bạn. Vui lòng thử lại sau.");
              });
          }
        })
        .catch(err => {
          console.error("Lỗi khi lấy dữ liệu sân gần nhất:", err);
          fetchFieldList()
            .then((allData) => {
              setCates(allData.cates || []);
              setFieldList(allData.fieldList || []);
              setError("Không thể tìm sân gần nhất. Đang hiển thị tất cả các sân có sẵn.");
            })
            .catch((backupErr) => {
              console.error("Lỗi khi load danh sách sân backup:", backupErr);
              setError(err.message || "Không thể tìm sân gần nhất. Vui lòng thử lại sau.");
            });
        })
        .finally(() => setLoading(false));
    } else {
      fetchFieldList()
        .then((data) => {
          setCates(data.cates || []);
          setFieldList(data.fieldList || []);
        })
        .catch((err) => console.error("Error fetching fields:", err))
        .finally(() => setLoading(false));
    }
  }, [searchParams]);


  const hasCategories = useMemo(() => cates && cates.length > 0, [cates]);
  if (loading) return <Loader />;
  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger m-4 text-center">
          <h4>Đã xảy ra lỗi khi tìm sân gần nhất</h4>
          <p>{error}</p>
          <button className="btn btn-primary mt-3" onClick={() => {
            setError(null);
            window.location.href = '/sportify/field';
          }}>
            Quay lại trang sân bóng
          </button>
        </div>
      </div>
    );
  }


  const filtered = fieldList
    .filter((f) => {
      if (!f) return false;
      // Filter by category
      if (selectedCategory && selectedCategory !== "tatca") {
        if (f.sporttype?.sporttypeid !== selectedCategory && f.sporttypeid !== selectedCategory) {
          return false;
        }
      }
      // Filter by owner name
      if (searchOwner.trim()) {
        const ownerName = f.owner?.businessName?.toLowerCase() || "";
        if (!ownerName.includes(searchOwner.toLowerCase())) {
          return false;
        }
      }
      // Filter by address
      if (searchAddress.trim()) {
        const address = f.address?.toLowerCase() || "";
        if (!address.includes(searchAddress.toLowerCase())) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.price - b.price;
      if (sortOrder === "desc") return b.price - a.price;
      return 0;
    });

  const handleSort = (order: "asc" | "desc" | "") => {
    setSortOrder(order);
  };

  return (
    <div>
      <HeroSection
        backgroundImage="/user/images/backgroundField.gif"
        title="Sân"
        breadcrumbs={[
          { label: "Trang Chủ", href: "/sportify" },
          { label: "Sân" }
        ]}
      />
      <section className="ftco-section">
        <div className="container-fluid field-container px-3 px-lg-5">
          {error && (
            <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
              <i className="fa fa-info-circle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          <div className="row g-3 align-items-end mb-4 filter-bar">
            <div className="col-lg-4 col-md-5 col-sm-12">
              <label className="form-label fw-semibold text-success mb-2">Tìm sân gần nhất</label>
              <NearestFieldFinder
                className="nearest-field-inline w-100"
                categorySelect={selectedCategory}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6">
              <label className="form-label fw-semibold text-success mb-2">Loại sân</label>
              <select
                className="form-select shadow-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {hasCategories ? (
                  cates.map((c) => (
                    <option key={c.sporttypeid} value={c.sporttypeid}>
                      {c.categoryname}
                    </option>
                  ))
                ) : (
                  <option value="tatca">Tất cả</option>
                )}
              </select>
            </div>

            <div className="col-lg-4 col-md-3 col-sm-6">
              <label className="form-label fw-semibold text-success mb-2">Sắp xếp</label>
              <div className="dropdown w-100">
                <button
                  className="btn btn-success w-100 d-flex justify-content-between align-items-center"
                  type="button"
                  id="sortDropdown"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {sortOrder === "asc" && "Giá tăng dần"}
                  {sortOrder === "desc" && "Giá giảm dần"}
                  {sortOrder === "" && "Lọc"}
                  <i className="fa fa-chevron-down ms-2"></i>
                </button>
                <div className="dropdown-menu dropdown-menu-end w-100" aria-labelledby="sortDropdown">
                  <button className="dropdown-item" type="button" onClick={() => handleSort("")}>
                    Mặc định
                  </button>
                  <button className="dropdown-item" type="button" onClick={() => handleSort("asc")}>
                    Giá tăng dần
                  </button>
                  <button className="dropdown-item" type="button" onClick={() => handleSort("desc")}>
                    Giá giảm dần
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <label className="form-label fw-semibold text-success mb-2">Tìm chủ sân</label>
              <input
                type="text"
                className="form-control shadow-sm"
                placeholder="Nhập tên chủ sân..."
                value={searchOwner}
                onChange={(e) => setSearchOwner(e.target.value)}
              />
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <label className="form-label fw-semibold text-success mb-2">Tìm địa chỉ</label>
              <input
                type="text"
                className="form-control shadow-sm"
                placeholder="Nhập đường, quận, thành phố..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-4">
            {filtered.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info text-center">Không có sân phù hợp.</div>
              </div>
            ) : (
              filtered.map((e) => (
                <div key={e.fieldid} className="col-lg-4 col-md-6">
                  <div className="card h-100 shadow-sm border-0 field-card">
                    <div className="field-card__image-wrapper">
                      <img
                        className="img-fluid field-card__image"
                        src={getImageUrl(e.image)}
                        alt={e.namefield}
                      />
                    </div>
                    <div className="card-body d-flex flex-column field-card__body">
                      <div className="small text-muted mb-2 d-flex flex-wrap gap-2 align-items-center">
                        <span className="text-info"><i className="fa fa-map-marker me-1"></i>{e.address || "Chưa cập nhật"}</span>
                        {fieldDistances[e.fieldid] && (
                          <span className="nearest-distance-pill">
                            <i className="fa fa-location-arrow"></i>
                            {fieldDistances[e.fieldid]}
                          </span>
                        )}
                      </div>
                      <h5 className="card-title fw-bold mb-2">
                        <a
                          href={`/sportify/field/detail/${e.fieldid}`}
                          className="text-decoration-none text-dark"
                        >
                          {e.namefield}
                        </a>
                      </h5>
                      <p className="mb-3">
                        <span className="fw-semibold text-success">Chủ sân:</span>{' '}
                        <span>{e.owner?.businessName || "Đang cập nhật"}</span>
                      </p>
                      <p className="mb-3 owner-contact">
                        <span className="fw-semibold text-success">Liên hệ:</span>{' '}
                        {e.owner?.phone ? (
                          <a href={`tel:${e.owner.phone}`} className="text-decoration-none">
                            {e.owner.phone}
                          </a>
                        ) : (
                          <span>Đang cập nhật</span>
                        )}
                      </p>
                      <p className="mb-3">
                        <span className="fw-semibold text-success">Loại sân:</span>{' '}
                        <span>{e.sporttype?.categoryname}</span>
                      </p>
                      <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                        <a
                          href={`/sportify/field/detail/${e.fieldid}`}
                          className="btn btn-outline-success px-3"
                        >
                          Chọn sân này
                        </a>
                        <span className="text-danger fw-bold fs-5">
                          {e.price.toLocaleString()} VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
