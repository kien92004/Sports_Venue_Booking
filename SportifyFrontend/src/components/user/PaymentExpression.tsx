import React from 'react';
import { Link } from 'react-router-dom';
import ListCardBank from './ListCardBank';

interface PaymentExpressionProps {
  titleButton: string;
  showCardList: boolean;
  setShowCardList: (show: boolean) => void;
  username?: string;
  selectedCardId?: string | undefined;
  setSelectedCardId: (cardId: string | undefined) => void;
}

const PaymentExpression: React.FC<PaymentExpressionProps> = ({
  titleButton,
  showCardList,
  setShowCardList,
  username,
  selectedCardId,
  setSelectedCardId
}) => {
  return (
    <div className="cart-detail p-3 p-md-4" style={{ backgroundColor: "#F1F6F9" }}>
      <h3 className="billing-heading mb-4">Hình thức thanh toán</h3>
      <div className="form-group">
        <div className="col-md-12">
          <div className="radio flex items-center gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="optradio"
                className="mr-5 w-auto"
                checked={!showCardList}
                onChange={() => {
                  setShowCardList(false);
                  setSelectedCardId(undefined);
                }}
              />
              <img
                style={{ width: "24px", height: "24px", marginRight: "6px" }}
                src="/user/images/iconVNP.png"
                alt="VNPay"
              />
              <span>VNPay</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="optradio"
                className="mr-5 w-auto"
                checked={showCardList}
                onChange={() => setShowCardList(true)}
              />
              <span>Chọn thẻ đã lưu</span>
            </label>
          </div>

          {showCardList && username && (
            <ListCardBank
              username={username}
              showDeleteButton={false}
              showDefaultButton={false}
              selectedCardId={selectedCardId}
              onCardSelect={(cardId) => setSelectedCardId(cardId)}
            />
          )}
        </div>
      </div>

      <div style={{ color: "black" }} className="font-italic">
        Khi nhấn vào nút này bạn công nhận mình đã đọc và đồng ý với các
        <Link to="/sportify/regulations" style={{ color: "blue" }}> Điều khoản & Điều Kiện </Link> và
        <Link to="/sportify/policy" style={{ color: "blue" }}> Chính sách quyền riêng tư</Link> của Sportify.
        <p>
          <button type="submit" className="btn btn-primary py-3 px-4 mt-3">{titleButton}</button>
        </p>
      </div>
    </div>
  );
};

export default PaymentExpression;