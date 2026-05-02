import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../../../service/user/home/eventApi';
import getImageUrl from '../../../helper/getImageUrl';
import HeroSection from "../../../components/user/Hero"; // Thêm import

interface EventItem {
  eventid: number;
  nameevent: string;
  datestart: string;
  dateend?: string;
  image?: string;
  descriptions?: string;
  eventtype?: string;
}

interface ApiResponse {
  content: EventItem[];
  totalPages: number;
  number: number; // current page (0-based)
  first: boolean;
  last: boolean;
  totalElements: number;
  size: number;
}

/**
 * Thể thao → backend loại trừ Bảo trì & Khuyến mãi (gộp mọi môn: bóng đá, cầu lông, …).
 * Các mục còn lại lọc theo đúng `eventtype` trong DB (không phân biệt hoa/thường).
 */
const EVENT_FILTER_TYPES = ['Thể thao', 'Bảo trì', 'Khuyến mãi'] as const;

const Event: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(4);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const fetchEventsData = async (pageNumber = 0, type = '', key = '') => {
    setLoading(true);
    try {
      const data: ApiResponse = await fetchEvents({ page: pageNumber, size, eventType: type, keyword: key });
      setEvents(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(data.number || 0);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEventsData(0, filterType, keyword);
  };

  const handleFilter = (type: string) => {
    if (type === '') {
      setFilterType('');
      fetchEventsData(0, '', keyword);
      return;
    }
    const newType = filterType === type ? '' : type;
    setFilterType(newType);
    fetchEventsData(0, newType, keyword);
  };

  const goToPage = (p: number) => {
    if (p < 0 || p >= totalPages) return;
    fetchEventsData(p, filterType, keyword);
  };

  return (
    <div>
      <HeroSection
        backgroundImage="/user/images/eventbanner.png"
        title="Tin Tức"
        breadcrumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Tin Tức" }
        ]}
      />
      <section className="col-12 ftco-section testimony-section img"
        style={{ backgroundImage: "url(/user/images/bgAll.png)" }}>
        <div className="overlay1"></div>
        <div className="col-12 justify-content-center d-flex px-2 px-lg-3">
          <div className="col-12 col-xl-11 d-flex flex-column flex-lg-row gap-4 align-items-stretch pt-4 pb-2">
            <div
              className="news-filter-sidebar col-12 col-lg-4 col-xl-3 d-flex flex-column"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
            >
              <div
                className="rounded-4 shadow p-4 h-100 d-flex flex-column"
                style={{
                  background: 'rgba(255, 255, 255, 0.94)',
                  border: '1px solid rgba(25, 135, 84, 0.15)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <h5 className="fw-semibold text-success mb-3 small text-uppercase" style={{ letterSpacing: '0.06em' }}>
                  Loại tin tức
                </h5>
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className={`btn rounded-3 py-2 fw-medium ${
                      filterType === '' ? 'btn-success shadow-sm' : 'btn-outline-success'
                    }`}
                    onClick={() => handleFilter('')}
                  >
                    Tất cả
                  </button>
                  {EVENT_FILTER_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`btn rounded-3 py-2 fw-medium ${
                        filterType === type ? 'btn-success shadow-sm' : 'btn-outline-success'
                      }`}
                      onClick={() => handleFilter(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <form className="mt-4 pt-3 border-top border-success border-opacity-25" onSubmit={handleSearchSubmit}>
                  <label htmlFor="event-keyword" className="form-label small text-muted mb-1">
                    Tìm kiếm theo tên
                  </label>
                  <div className="input-group shadow-sm rounded-3 overflow-hidden">
                    <input
                      id="event-keyword"
                      className="form-control border-0"
                      placeholder="Nhập tên sự kiện..."
                      maxLength={200}
                      aria-label="Tìm kiếm theo tên"
                      type="search"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button className="btn btn-success px-3" type="submit" aria-label="Tìm">
                      <span className="fa fa-search" aria-hidden />
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div id="carouselExampleIndicators" className="carousel slide col-12 col-lg-8 flex-grow-1"
              data-ride="carousel" style={{ width: "100%", height: "400px" }}>
              <ol className="carousel-indicators">
                <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
              </ol>
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img className="d-block w-100" src="/user/images/event3.png"
                    alt="First slide" style={{ height: "400px", objectFit: "cover" }} />
                </div>
                <div className="carousel-item">
                  <img className="d-block w-100" src="/user/images/event4.png"
                    alt="Second slide" style={{ height: "400px", objectFit: "cover" }} />
                </div>
                <div className="carousel-item">
                  <img className="d-block w-100" src="/user/images/event5.png"
                    alt="Third slide" style={{ height: "400px", objectFit: "cover" }} />
                </div>
              </div>
              <a className="carousel-control-prev" href="#carouselExampleIndicators"
                role="button" data-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="sr-only">Previous</span>
              </a>
              <a className="carousel-control-next" href="#carouselExampleIndicators"
                role="button" data-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="sr-only">Next</span>
              </a>
            </div>
          </div>
        </div>

        <div className="col-12 d-flex justify-content-center px-3 py-4">
          {loading && <div className="text-muted">Đang tải...</div>}
        </div>
      </section>

      <section className="ftco-section"
        style={{ 
          backgroundImage: "url('/user/images/bgAll.png')", 
          backgroundRepeat: "repeat", 
          backgroundSize: "100% 100%" 
        }}>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="row">
                <h2 className="col-12" style={{ textAlign: "center" }}>Các sự kiện mới nhất</h2>
                <hr className="col-2 mb-5 hr1" />
              </div>

              {!loading && events.length === 0 && (
                <div className="row d-flex">
                  <div className="col-12 text-center text-muted py-5">
                    {keyword.trim() || filterType
                      ? 'Không tìm thấy tin tức phù hợp với bộ lọc hoặc từ khóa.'
                      : 'Chưa có tin tức để hiển thị.'}
                  </div>
                </div>
              )}

              <div className="row d-flex">
                {events.map((ev) => (
                  <div key={ev.eventid} className="col-lg-6 d-flex align-items-stretch">
                    <div className="blog-entry d-md-flex event-item"
                      style={{ boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)" }}>
                      <img 
                        className="block-19 block-20 img" 
                        style={{ objectFit: "cover" }}
                        alt={ev.nameevent} 
                        src={ev.image ? getImageUrl(ev.image) : '/user/images/default.png'}
                      />
                      <div className="text p-4 bg-light">
                        <div className="meta d-flex">
                          <span className="fa fa-calendar m-2"></span>
                          <p className="m-1" style={{ color: "blue", fontSize: "15px" }}>
                            {new Date(ev.datestart).toLocaleDateString('vi-VN')}
                            {ev.dateend && ` - ${new Date(ev.dateend).toLocaleDateString('vi-VN')}`}
                          </p>
                        </div>
                        <div className="meta d-flex">
                          <h3 className="heading mb-3 m-1">
                            <a 
                              href={`/sportify/eventdetail/${ev.eventid}`}
                            >
                              {ev.nameevent}
                            </a>
                          </h3>
                        </div>
                        <div className="meta d-flex">
                          <p className="limited-length2">
                            {ev.descriptions}
                          </p>
                        </div>
                        <a
                          href={`/sportify/eventdetail/${ev.eventid}`}
                          className="btn-custom"
                        >
                          Xem Thêm <span className="fa fa-long-arrow-right"></span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="row col-md-12 mt-5">
                <div className="col text-center">
                  <div className="block-27 ml-5">
                    <ul className="pagination d-flex justify-content-center ml-5">
                      {/* Previous button */}
                      {page > 0 && (
                        <li className="ml-1 mr-1 mb-5">
                          <a href="#" onClick={(e) => { e.preventDefault(); goToPage(page - 1); }}>&laquo;</a>
                        </li>
                      )}
                      
                      {/* Page numbers */}
                      {totalPages > 1 && Array.from({ length: totalPages }).map((_, idx) => (
                        <li key={idx} className="ml-1 mr-1 mb-5">
                          <a 
                            href="#"
                            className={page === idx ? 'bg-success text-white' : ''}
                            onClick={(e) => { e.preventDefault(); goToPage(idx); }}
                          >
                            {idx + 1}
                          </a>
                        </li>
                      ))}
                      
                      {/* Next button */}
                      {page < totalPages - 1 && (
                        <li className="ml-1 mr-1 mb-5">
                          <a href="#" onClick={(e) => { e.preventDefault(); goToPage(page + 1); }}>&raquo;</a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Event;