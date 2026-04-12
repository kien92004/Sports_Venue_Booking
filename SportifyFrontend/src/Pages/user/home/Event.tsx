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
    const newType = filterType === type ? '' : type; // toggle
    setFilterType(newType);
    fetchEventsData(0, newType, keyword);
  };

  const goToPage = (p: number) => {
    if (p < 0 || p >= totalPages) return;
    fetchEventsData(p, filterType, keyword);
  };

  // deduplicate event types from fetched events for the filter buttons
  const eventTypes = Array.from(new Set(events.map((e:any) => e.eventtype).filter(Boolean))) as string[];

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
        <div className="col-12 justify-content-center d-flex">
          <div className="col-10 d-flex">
            <div className="col-4 bg-dark justify-content-center d-flex">
              <div className="col-8">
                <button 
                  className={`col-12 mt-5 rounded ${filterType === '' ? 'btn-primary' : 'bg-light'}`}
                  type="button"
                  onClick={() => handleFilter('')}
                >
                  Tất cả
                </button>
                {eventTypes.map((type) => (
                  <button 
                    key={type}
                    className={`col-12 mt-5 rounded ${filterType === type ? 'btn-primary' : 'bg-light'}`}
                    type="button"
                    onClick={() => handleFilter(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div id="carouselExampleIndicators" className="carousel slide col-8"
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

        <div className="col-12 row mt-5 justify-content-center">
          <form className="d-flex col-5" onSubmit={handleSearchSubmit}>
            <input 
              className="form-control rounded-0 me-2 col-9"
              placeholder="Tìm kiếm theo tên..." 
              maxLength={200} 
              aria-label="Search"
              type="search" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="btn btn-success col-3 rounded-0" type="submit">Search</button>
          </form>
        </div>

        {/* Search results message */}
        <div className="d-flex justify-content-center col-12 mt-2">
          <div className="col-5 justify-content-center">
            {loading && <div>Đang tải...</div>}
            {!loading && events.length === 0 && keyword && <div>Không tìm thấy sự kiện nào.</div>}
          </div>
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

              {/* No results message */}
              {!loading && events.length === 0 && (
                <div className="row d-flex">
                  <div className="col-12 text-center">Không tìm thấy sự kiện nào.</div>
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