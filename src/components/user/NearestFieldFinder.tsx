import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NearestFieldFinderProps {
  className?: string;
  categorySelect?: string; // Thêm prop để truyền loại sân được chọn
}

const NearestFieldFinder = ({ className, categorySelect = 'tatca' }: NearestFieldFinderProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Tìm sân gần nhất - Phiên bản đơn giản
  const findNearestFields = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị. Sử dụng tọa độ mặc định.");
      useDefaultLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        console.log('Đã lấy được tọa độ gốc:', lat, lng);
        
        // Kiểm tra và đảm bảo tọa độ hợp lệ cho Việt Nam (khoảng 8-23 vĩ độ và 102-109 kinh độ)
        const fixedLng = Math.abs(lng);  // Đảm bảo kinh độ luôn dương với Việt Nam
        
        // Kiểm tra tọa độ có nằm trong vùng Việt Nam không
        if (lat < 8 || lat > 23 || fixedLng < 102 || fixedLng > 109) {
          console.log('Cảnh báo: Tọa độ nằm ngoài Việt Nam, dùng tọa độ mặc định TP.HCM');
          useDefaultLocation();
          return;
        } else {
          lng = fixedLng; // Sử dụng fixedLng nếu nằm trong phạm vi hợp lệ
        }
        
        console.log('Tọa độ sau điều chỉnh:', lat, lng);
        
        // Chuyển hướng với tọa độ và loại sân
        navigate(`/sportify/field?latitude=${lat}&longitude=${lng}&categorySelect=${categorySelect}`);
        setLoading(false);
      },
      (error) => {
        console.error('Lỗi định vị:', error);
        // Fallback: sử dụng tọa độ mặc định
        useDefaultLocation();
      }
    );
  };

  const useDefaultLocation = () => {
    console.log('Sử dụng tọa độ mặc định TP.HCM');
    const defaultLat = 10.7769;
    const defaultLng = 106.7;
    navigate(`/sportify/field?latitude=${defaultLat}&longitude=${defaultLng}&categorySelect=${categorySelect}`);
    setLoading(false);
  };

  return (
    <div className={`nearest-field-finder ${className || ''}`}>
      <button 
        onClick={findNearestFields} 
        disabled={loading}
        className="find-nearest-btn"
        title="Click để tìm sân gần vị trí của bạn nhất"
      >
        {loading ? "Đang tìm..." : "Tìm sân gần nhất"}
      </button>
      
      {error && <div className="error-message" style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>{error}</div>}
    </div>
  );
};

export default NearestFieldFinder;