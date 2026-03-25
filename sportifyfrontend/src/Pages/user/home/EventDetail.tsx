import React, { useEffect, useState } from 'react';
import { fetchEventDetail } from '../../../service/user/home/eventApi';
import { useParams, Link } from 'react-router-dom';
import HeroSection from '../../../components/user/Hero';

interface EventDetailData {
  eventdetail: EventItem;
  eventLQ: EventItem[];
}

interface EventItem {
  eventid: number;
  nameevent: string;
  datestart: string;
  dateend?: string;
  image?: string;
  descriptions?: string;
  eventtype?: string;
}

const EventDetail: React.FC = () => {
  const { eventid } = useParams<{ eventid: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [related, setRelated] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!eventid) return;
      setLoading(true);
      setError(null);
      try {
        const data: EventDetailData = await fetchEventDetail(eventid);
        setEvent(data.eventdetail || null);
        setRelated(data.eventLQ || []);
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin sự kiện.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [eventid]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-danger">{error}</div>;
  if (!event) return <div className="p-4 text-center">Không tìm thấy sự kiện.</div>;

  return (
    <div>
      <HeroSection
        backgroundImage={event.image ? `/user/images/${event.image}` : `/user/images/eventbanner.png`}
        title="Chi Tiết Tin Tức"
        breadcrumbs={[
          { label: 'Trang Chủ', href: '/' },
          { label: 'Sự Kiện', href: '/sportify/event' },
          { label: 'Chi Tiết tin Tức' }
        ]}
      />

      <section 
        className="ftco-section ftco-degree-bg" 
        style={{ 
          backgroundImage: "url('/user/images/bgAll.png')", 
          backgroundRepeat: 'repeat', 
          backgroundSize: '100% 100%' 
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <h2 className="mb-3">{event.nameevent}</h2>
              <div className="meta d-block col-12 row">
                <div className="row col-6">
                  <span className="fa fa-calendar m-2"></span>
                  <label className="m-1">Ngày bắt đầu:</label>
                  <p className="m-1" style={{ color: 'blue' }}>
                    {new Date(event.datestart).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {event.dateend && (
                  <div className="row col-6">
                    <span className="fa fa-calendar m-2"></span>
                    <label className="m-1">Ngày kết thúc:</label>
                    <p className="m-1" style={{ color: 'red' }}>
                      {new Date(event.dateend).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
              <p>
                <img 
                  src={event.image ? `/user/images/${event.image}` : '/user/images/eventbanner.png'} 
                  alt={event.nameevent} 
                  style={{ height: '600px', width: '900px' }}
                  className="img-fluid"
                />
              </p>
              <p 
                className="event-description" 
                style={{ color: 'black', fontSize: '18px', whiteSpace: 'pre-line' }}
              >
                {event.descriptions}
              </p>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4 sidebar pl-lg-5">
              <h3 className="d-flex">Tin Tức Trong Tháng</h3>
              
              {related && related.length > 0 ? (
                related.map((r) => (
                  <div 
                    key={r.eventid}
                    className="block-25 mb-4 d-flex bg-light" 
                    style={{
                      borderRadius: '5px',
                      width: '380px',
                      height: '180px',
                      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="img-tintuc">
                      <Link to={`/sportify/eventdetail/${r.eventid}`}>
                        <img 
                          className="blog-img mr-4" 
                          alt="Image" 
                          src={r.image ? `/user/images/${r.image}` : '/user/images/event3.png'}
                          style={{ width: '180px', height: '180px', objectFit: 'fill' }}
                        />
                      </Link>
                    </div>
                    
                    <div className="text">
                      <h3 className="mt-3 heading limited-length3">
                        <Link to={`/sportify/eventdetail/${r.eventid}`}>
                          {r.nameevent}
                        </Link>
                      </h3>
                      <div className="meta">
                        <div className="meta d-flex">
                          <span className="fa fa-calendar mt-2"></span>
                          <p className="m-1" style={{ color: 'blue' }}>
                            {new Date(r.datestart).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="mt-1 ml-3 mr-3"> | </p>
                          <p className="m-1" style={{ color: 'blue' }}>
                            {r.eventtype || 'Sự kiện'}
                          </p>
                        </div>
                        <div className="meta d-flex">
                          <p className="limited-length4">{r.descriptions}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-muted">Không có sự kiện liên quan.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


export default EventDetail;
