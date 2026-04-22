const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import PaymentExpression from '../../../components/user/PaymentExpression';
import VoucherSelect from '../../../components/user/VoucherSelect';
import getImageUrl from '../../../helper/getImageUrl';
import { fetchBookingData } from '../../../service/user/checkout/checkBookingFields';

interface SportType {
  sporttypeid: string;
  categoryname: string;
}

interface Field {
  fieldid: number;
  sporttypeid: string;
  namefield: string;
  descriptionfield: string;
  price: number;
  image: string;
  address: string;
  status: boolean;
  sporttype: SportType;
}

interface User {
  username: string;
  passwords: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  address: string;
  image?: string | null;
  gender: boolean;
  status: boolean;
}

interface Voucher {
  voucherid: string;
  discountpercent: number;
  startdate: string;
  enddate: string;
}

interface UserVoucher {
  id: number;
  username: string;
  voucherid: Voucher;
  quantity: number;
  startDate: string;
  endDate: string;
}

const CheckoutDatSan: React.FC = () => {

  const fieldid = useParams().idField || '';
  const location = useLocation();

  // Lấy nameshift từ cả nameShift và nameshift để đảm bảo nhận đúng giá trị
  const searchParams = new URLSearchParams(location.search);
  const dateselect = searchParams.get('dateselect') || '';
  // Lấy shiftid từ query string (nếu có)
  const shiftid = searchParams.get('shiftid') || '';
  const parmanent = searchParams.get('parmanent') || '';

  const [user, setUser] = useState<User | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [note, setNote] = useState('');
  const [totalDay, setTotalDay] = useState(0);
  const [nameshift, setNameshift] = useState("");
  const [amount, setAmount] = useState(0);
  const [thanhtien, setThanhtien] = useState(0);
  const [tamtinh, setTamtinh] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [pricefield, setPricefield] = useState(0);
  const [error, setError] = useState('');
  const [shifts, setShifts] = useState<{ dayOfWeek: number; shiftId: number }[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCardList, setShowCardList] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);
  const [_userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [voucherOfUserId, setVoucherOfUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!fieldid) return;

    fetchBookingData(fieldid, parmanent, shiftid, dateselect)
      .then((data) => {
        console.log("Booking data:", data);

        const f = data.fieldListById ? data.fieldListById[0] : data.field;
        if (!f) {
          console.error("Không tìm thấy thông tin sân trong response");
          return;
        }
        setUser(data.user);
        setField(f);
        setPricefield(f.price);
        const totalPrice = data.totalprice || data.totalPrice || 0;
        setThanhtien(totalPrice);
        setTamtinh(totalPrice);
        setAmount(Math.round(totalPrice * 0.3));
        setTotalDay(data.totalDay || 1);
        setNameshift(data.nameShift);
        setShifts(data.shifts || []);
        setStartDate(data.startDate || '');
        setEndDate(data.endDate || '');
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API booking:", err);
      });
  }, [fieldid, shiftid, dateselect, parmanent]);

  useEffect(() => {
    if (user?.username) {
      fetch(`${URL_BACKEND}/api/user/voucher-of-user?username=${user.username}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setUserVouchers(data);
        })
        .catch(err => console.error('Error fetching vouchers:', err));
    }
  }, [user?.username]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const allowedCharactersRegex = /^[,.\p{L}0-9\s]*$/u;
    const maxLength = 5000;
    if (!allowedCharactersRegex.test(val)) {
      setError('Không nhập ký tự đặc biệt, ngoại trừ , và .');
    } else if (val.length > maxLength) {
      setError(`Tối đa ${maxLength} ký tự`);
    } else {
      setError('');
      setNote(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;

    // Tạo object JSON
    const payload = {
      amount,
      thanhtien,
      note,
      fieldid: field?.fieldid || null,
      pricefield,
      phone: user?.phone || '',
      discountCode: appliedCode || '', // Add applied voucher code
      shiftId: (shiftid) || null,
      shifts: shifts.map(s => ({ dayOfWeek: s.dayOfWeek, shiftId: s.shiftId })),
      playdate: dateselect || null,       // định dạng 'yyyy-MM-dd'
      startDate: startDate || null,                  // định dạng 'yyyy-MM-dd'
      endDate: endDate || null,                    // định dạng 'yyyy-MM-dd' 
      voucherOfUserId: voucherOfUserId || undefined,            // định dạng 'yyyy-MM-dd'
      cardId: showCardList ? selectedCardId : undefined // Thêm cardId nếu chọn thẻ đã lưu
    };

    console.log('Payload JSON:', payload);

    try {
      const res = await fetch(`${URL_BACKEND}/api/user/getIp/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // ✅ CASE RIÊNG: SÂN ĐÃ BỊ ĐẶT
      if (res.status === 409) {
        alert(data?.message || 'Sân đã được người khác đặt!');
        window.location.href = '/sportify/field';
        return;
      }

      // ❌ Lỗi khác
      if (!res.ok) {
        alert(data?.message || data?.error || 'Có lỗi xảy ra, vui lòng thử lại!');
        return;
      }

      // ✅ Thành công
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Có lỗi khi thanh toán!');
      }

    } catch (err) {
      alert('Không thể kết nối đến hệ thống!');
    }



  };
  useEffect(() => {
    if (tamtinh > 0) {
      setThanhtien(tamtinh);
      setAmount(Math.round(tamtinh * 0.3));
    }
  }, [tamtinh]);


  if (!field) return <div>Loading...</div>;
  return (
    <div>
      <style>{`
        .info-content {
          display: none;
          background-color: #FAF0E4;
          color: #606C5D;
          font-weight: bold;
          padding: 5px;
          border: 1px solid #ccc;
          position: absolute;
          top: 20px;
          left: 0;
          z-index: 1;
          border-radius: 5px;
        }

        .info-icon {
          display: inline-block;
          width: 15px;
          height: 15px;
          background-color: #F2BE22;
          color: white;
          text-align: center;
          line-height: 15px;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
        }

        .info-container:hover .info-content {
          display: block;
        }
      `}</style>
      <section className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: "url('/user/images/bgcheckoutField.png')" }}>
        <div className="overlay"></div>
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9  mb-5 text-center">
              <p className="breadcrumbs mb-0">
                <span className="mr-2"><a href="/sportify">Trang Chủ <i className="fa fa-chevron-right"></i></a></span>
                <span className="mr-2"><a href="/sportify/field">Sân <i className="fa fa-chevron-right"></i></a></span>
                <span className="mr-2"><a href={`/sportify/field/detail/${field?.fieldid}`}>Chi Tiết Sân <i className="fa fa-chevron-right"></i></a></span>
                <span>Thanh Toán</span>
              </p>
              <h2 className="mb-0 bread">Thanh Toán</h2>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <section className="ftco-section">
          <div className="container">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-xl-10 ">
                  <h1 style={{ fontWeight: "bold" }} className="mb-4 d-flex justify-content-center">
                    PHIẾU ĐẶT SÂN THỂ THAO
                  </h1>

                  <div className="row mt-5 pt-3 d-flex" style={{ backgroundColor: "white", borderRadius: "15px" }}>
                    <div className="col-md-7 d-flex">
                      <div className="cart-detail cart-total p-3 p-md-4">
                        <div className="form-group">
                          <div>
                            <label>Tên khách hàng:</label>
                            <span style={{ color: "#1D5D9B", fontWeight: "bold" }}>{user?.firstname}</span>
                            <span style={{ color: "#1D5D9B", fontWeight: "bold", fontSize: "larger" }}>{user?.lastname}</span>
                          </div>
                          <div>
                            <label>Số điện thoại </label>
                            <span className="info-container">
                              <span className="info-icon">i</span>
                              <span className="info-content">
                                <p>Số điện thoại để đối chiếu khi đến nhận sân.</p>
                              </span>
                            </span>:
                            <span style={{ color: "#1D5D9B", fontWeight: "bold" }}>{user?.phone}</span>
                            <input type="hidden" name="phone" readOnly value={user?.phone || ""} className="form-control" />
                          </div>
                          <div>
                            <label htmlFor="Mail">Email</label>
                            <span className="info-container">
                              <span className="info-icon">i</span>
                              <span className="info-content">
                                <p>Email để nhận thông báo thông tin dặt sân, được lấy từ tài khoản của bạn.</p>
                              </span>
                            </span>:
                            <span style={{ color: "#1D5D9B", fontWeight: "bold" }}>{user?.email || ''}</span>
                            <input readOnly value={user?.email || ''} type="hidden" className="form-control" />
                          </div>
                          <div>
                            <label>Ghi chú thông tin ( nếu cần ) :</label>
                            <textarea name="note" value={note} onChange={handleNoteChange} className="form-control"></textarea>
                            {error && <span className="text-danger">{error}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-5 d-flex">
                      <div className="cart-detail cart-total p-3 p-md-4">
                        <div className="">
                          <div className="form-group">
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                              <img src="/user/images/Logo3.png" style={{ width: 40, marginRight: 10 }} alt="" />
                              <h5 style={{ color: "green", paddingTop: 20, fontWeight: "bold" }}>{field?.namefield}</h5>
                              <input type="hidden" name="fieldid" value={field?.fieldid || ""} />
                            </div>
                            <div>


                              {parmanent === 'true' ? (
                                <div>
                                  <div style={{ paddingLeft: 10 }}>
                                    <span>Ngày bắt đầu đặt sân:</span> &nbsp;
                                    <span style={{ color: "black" }}>{startDate}</span>
                                  </div>
                                  <div style={{ paddingLeft: 10 }}>
                                    <span>Ngày kết thúc đặt sân:</span> &nbsp;
                                    <span style={{ color: "black" }}>{endDate}</span>
                                  </div>
                                  <div style={{ paddingLeft: 10 }}>
                                    <span>Lịch đặt sân cố định:</span>
                                    <ul>
                                      {shifts.map((shift, idx) => (
                                        <li key={idx}>
                                          Thứ {shift.dayOfWeek} - Ca số {shift.shiftId}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>) : (
                                <div>
                                  <div style={{ paddingLeft: 10 }}>
                                    <span>Ngày nhận sân:</span> &nbsp;
                                    <span style={{ color: "black" }}>{dateselect}</span>
                                    <input type="hidden" name="playdate" value={dateselect} />
                                  </div>
                                  <div style={{ paddingLeft: 10 }}>
                                    <span>Giờ chơi:</span> &nbsp;
                                    <span id="nameshift-input" style={{ color: "black" }}>{nameshift}</span>
                                    <input type="hidden" name="shiftid" value={shiftid} />
                                  </div>
                                </div>
                              )
                              }
                            </div>
                            <div className="d-flex">
                              <img
                                style={{ width: "50%", height: "40%", marginRight: 20 }}
                                src={getImageUrl(field.image)}
                                alt="Image"
                              />
                              <div className="" style={{ marginTop: 10 }}>
                                &nbsp;
                                <span style={{ fontSize: "larger", fontWeight: "bold", color: "green" }}>
                                  {field?.sporttype?.categoryname}
                                </span>
                                <br />
                                <img src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v2/0/01cf1090e2f434a7d63f1cbca912ef44.svg" />
                                &nbsp; <span style={{ color: "green" }}>Wifi miễn phí</span> <br />
                                <img src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v2/2/252a55e9e8b214950105d0335e27a25e.svg" />
                                &nbsp; <span style={{ color: "green" }}>Có phục vụ nước uống</span>
                              </div>
                            </div>
                            <div>
                              <img src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v2/7/721a32c1f29c2034bf8f5659dc65b73e.svg" />
                              &nbsp; <span>Không áp dụng đổi lịch</span>
                            </div>
                            <div>
                              <img src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v2/a/ac4257c709f6621e4c315f641f60202f.svg" />
                              &nbsp; <span>Không hoàn tiền đã cọc</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-5 pt-3 d-flex">
                    <div className="col-md-6 d-flex">
                      <div className="cart-detail cart-total p-3 p-md-4" style={{ backgroundColor: "#F1F6F9", borderRadius: "12px" }}>
                        <h3 className="billing-heading mb-4">Tóm tắt giá</h3>
                        <div className="">
                          <div className="form-group">
                            <div className="d-flex">
                              <label>Giá Sân</label>
                              <span style={{ color: "black", fontWeight: "bold", marginLeft: "30px" }}>
                                {pricefield.toLocaleString()}₫
                              </span>
                              <input type="hidden" name="pricefield" value={pricefield} />
                            </div>
                            <div className='d-flex'>
                              <label >Số lượng </label>
                              <span style={{ color: "black", fontWeight: "bold", marginLeft: "30px" }}>
                                {totalDay.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <hr />
                        <div>
                          <div>
                            <VoucherSelect
                              username={user?.username}
                              tamtinh={tamtinh}
                              onApply={(discountCode, newThanhtien, voucherOfUserId) => {
                                setAppliedCode(discountCode);
                                setThanhtien(newThanhtien);
                                setAmount(Math.round(newThanhtien * 0.3));
                                setVoucherOfUserId(voucherOfUserId);
                              }}
                            />
                          </div>
                        </div>
                        <hr />
                        <div>
                          <span>Tạm tính :</span>
                          <span style={{ color: "black" }}>{tamtinh.toLocaleString()}₫</span>
                        </div>
                        <div>
                          <span style={{ color: "green" }}>Giảm giá :  </span>
                          {tamtinh !== thanhtien ? (
                            <span style={{ color: "green" }}>
                              {((tamtinh - thanhtien) / tamtinh * 100).toFixed(0)}% ({(tamtinh - thanhtien).toLocaleString()}₫)
                            </span>
                          ) : (
                            <span style={{ color: "black" }}>0₫</span>
                          )}
                        </div>
                        <div style={{ height: "40px", display: "flex", alignItems: "center" }}>
                          <span style={{ color: "red" }}>Thành Tiền:</span> &nbsp;
                          <span style={{ color: "black", fontWeight: "bold" }}>
                            {(thanhtien || 0).toLocaleString()}₫
                          </span>
                          <input type="hidden" name="thanhtien" value={thanhtien || 0} />
                        </div>
                        <div style={{ height: "40px", display: "flex", alignItems: "center" }}>
                          <span style={{ color: "red" }}>Cọc trước 30%
                            <span className="info-container">
                              <span className="info-icon">i</span>
                              <span className="info-content">
                                <p>Tiền quý khách thanh toán cọc giữ chổ theo quy định</p>
                              </span>
                            </span> &nbsp;
                          </span>
                          <span style={{ color: "black", fontWeight: "bold" }}>
                            {(amount || 0).toLocaleString()}₫
                          </span>
                          <input type="hidden" id="amountInput" name="amount" value={amount || 0} />
                        </div>
                        <div style={{ height: "40px", display: "flex", alignItems: "center" }}>
                          <span style={{ color: "red" }}>Thanh toán khi nhận sân:</span>
                          &nbsp;
                          <span style={{ color: "black", fontWeight: "bold" }}>
                            {((thanhtien || 0) - (amount || 0)).toLocaleString()}₫
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <PaymentExpression
                        titleButton="Đặt Sân"
                        showCardList={showCardList}
                        setShowCardList={setShowCardList}
                        username={user?.username}
                        selectedCardId={selectedCardId}
                        setSelectedCardId={setSelectedCardId}
                      />
                    </div>
                  </div>
                </div>
                {/* .col-md-8 */}
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};


export default CheckoutDatSan;
