import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../../styles/PaymentMethodResult.css';

interface PaymentDetails {
  status: string;
  vnp_TxnRef: string;
  vnp_CardType: string;
  vnp_BankCode: string;
  vnp_CardNumber: string;
}

const PaymentMethodResult: React.FC = () => {
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  
  useEffect(() => {
    // Parse URL parameters
    const searchParams = new URLSearchParams(location.search);
    
    const status = searchParams.get('status') || '';
    const vnp_TxnRef = searchParams.get('vnp_TxnRef') || '';
    const vnp_CardType = searchParams.get('vnp_CardType') || '';
    const vnp_BankCode = searchParams.get('vnp_BankCode') || '';
    const vnp_CardNumber = searchParams.get('vnp_CardNumber') || '';
    
    setPaymentDetails({
      status,
      vnp_TxnRef,
      vnp_CardType,
      vnp_BankCode,
      vnp_CardNumber
    });
  }, [location.search]);

  if (!paymentDetails) {
    return <div className="payment-loading">Loading payment result...</div>;
  }

  const isSuccess = paymentDetails.status.toLowerCase() === 'success';
  
  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        <div className={`payment-header ${isSuccess ? 'success' : 'failure'}`}>
          <h3>
            {isSuccess ? 'Payment Successful' : 'Payment Failed'}
          </h3>
        </div>
        
        <div className="payment-body">
          <div className="payment-icon">
            {isSuccess ? (
              <div className="success-icon">✓</div>
            ) : (
              <div className="failure-icon">✕</div>
            )}
          </div>
          
          <h4 className="payment-message">
            {isSuccess 
              ? 'Tạo thẻ thành công!' 
              : 'Có vấn đề xảy ra với quán trình tạo thẻ  của bạn.'}
          </h4>
          
          <div className="payment-details">
            <h5 className="details-title">Chi tiết thẻ</h5>
            <div className="detail-row">
              <span className="detail-label"> ID:</span>
              <span className="detail-value">{paymentDetails.vnp_TxnRef}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tên Thẻ:</span>
              <span className="detail-value">{paymentDetails.vnp_CardType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngân hàng :</span>
              <span className="detail-value">{paymentDetails.vnp_BankCode}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Số thẻ:</span>
              <span className="detail-value">{paymentDetails.vnp_CardNumber}</span>
            </div>
          </div>
          
          <div className="payment-actions">
            <a 
              className={`action-button home-button ${isSuccess ? 'success-button' : 'secondary-button'  } nav-link`}
              href='/sportify/profile/listcard'
            >
              Trang quản lí thẻ
            </a>
         
          </div>
          
          {!isSuccess && (
            <div className="payment-support">
              <p>If you continue to experience issues, please contact our support team.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodResult;
