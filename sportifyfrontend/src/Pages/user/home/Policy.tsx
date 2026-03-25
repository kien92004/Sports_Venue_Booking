import React, { useEffect } from 'react';
import Nav_contact from '../../../components/user/Nav_contact';

const Policy: React.FC = () => {
  useEffect(() => {
    document.title = 'SPORTIFY - Chính Sách';
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = '/user/images/logotitle.png';
  }, []);

  return (
    <>
      <Nav_contact title='Chính Sách - Quy Định' />
      
      <section className="ftco-section ftco-no-pb">
        <div className="container">
          <div className="row">
            <div className="col-md-12 img img-3 justify-content-center align-items-center" 
              style={{ backgroundImage: "url(/user/images/Logo3.png)" }}>
            </div>
            <div className="col-md-12 wrap-about pl-md-5 py-5">
              <div className="heading-section">
                <h2 className="mb-4">Sportify - Nền tảng đa năng cho đặt sân, tạo đội và mua sắm sản phẩm thể thao</h2>

                <h4 style={{ color: 'green', fontWeight: 'bold' }}>1. Chính sách đặt sân</h4>
                <p>(a) Khi bạn sử dụng dịch vụ ở <b className="font-weight-bold">SPORTIFY</b> sẽ được hưởng quyền lợi:<br />
                  + Hoàn tiền cọc Đặt sân 100% giá trị đã thanh toán thành công nếu hệ thống bị lỗi do đội ngũ phát triển website. <br />
                  + Bồi thường 200% giá trị cọc đã thành toán thành công nếu hệ thống ghi nhận có lịch trùng ca với người khác trên cùng 1 tên sân.</p>
                <p>(b) Nếu bạn hủy Đơn đặt hoặc vắng mặt, mọi khoản phí cọc đã thanh toán thành công bên chúng tôi sẽ <b className="font-weight-bold">Không được hỗ trợ hoàn lại.</b> </p>
                <p>(c) Nếu bạn nghĩ rằng bạn sẽ không thể đến đúng hẹn, vui lòng liên hệ cho chúng tôi biết thời gian đến dự kiến, để chúng tôi không hủy Đơn đặt của bạn. Nếu bạn đến muộn, chúng tôi <b className="font-weight-bold">không</b> chịu trách nhiệm về hậu quả (ví dụ: Đơn đặt bị hủy, hoặc bất kỳ khoản phí nào chúng tôi có thể thu).</p>
                <h4 style={{ color: 'green', fontWeight: 'bold' }}>2. Chính sách đặt hàng tại SHOP-SPORTIFY:</h4>
                <p>(a) Khi bạn mua sắm ở <b className="font-weight-bold">SHOP-SPORTIFY</b> sẽ được hưởng quyền lợi:<br />
                  + Hoàn tiền Đơn hàng & Phí ship 100% giá trị đã thanh toán thành công nếu hệ thống bị lỗi do đội ngũ phát triển website. <br />
                  + Hoàn tiền Đơn hàng <b className="font-weight-bold">Không hoàn phí ship</b> 100% giá trị trên từng sản phẩm đã thanh toán thành công nếu quý khách từ chối nhận hàng hoặc không nghe máy khi shipper liên hệ 3 lần <br />
                  + Hoàn tiền Đơn hàng & Phí ship 100% giá trị trên từng sản phẩm đã thanh toán thành công nếu hết hàng hoặc hàng không đủ chất lượng để cung cấp đến tay Quý khách. <br />
                  + Bồi thường 200% giá trị sản phẩm nếu khách hàng nhận sản phẩm kém chất lượng không giống như mô tả <b className="font-weight-bold">( phải có video bóc kiểm hàng và gửi lại shop đúng sản phẩm còn tem )</b> tại website <b className="font-weight-bold">Sportify.com</b> </p>
                <p>(b) Chúng tôi sẽ <b className="font-weight-bold">Không hoàn tiền</b> đã thanh toán thành công khi hàng bị lỗi hoặc không như mong muốn đã <b className="font-weight-bold">bị mất tem hoặc không có video bóc hàng chứng minh.</b></p>
                <p>(c) Chúng tôi sẽ <b className="font-weight-bold">Không hoàn tiền Phí ship</b> đã thanh toán thành công khi hàng được shipper liên hệ giao cho quý khách không nghe máy hoặc lý do khác.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Policy;