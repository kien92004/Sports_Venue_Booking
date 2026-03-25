import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loader from "../../../components/user/Loader";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const NearestFieldPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNearestFields = async () => {
      try {
        const latitude = searchParams.get('latitude');
        const longitude = searchParams.get('longitude');

        if (!latitude || !longitude) {
          throw new Error('Thiếu tọa độ để tìm sân gần nhất.');
        }

        // Gọi API backend
        const response = await fetch(`${BACKEND_URL}/api/sportify/field/nearest?latitude=${latitude}&longitude=${longitude}`);

        // Kiểm tra response
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Không tìm thấy API tìm sân gần nhất.');
          } else {
            throw new Error(`Lỗi API: ${response.status}`);
          }
        }

        // Chuyển đến trang danh sách sân
        navigate('/sportify/field', {
          state: {
            fromNearestSearch: true,
            latitude,
            longitude
          }
        });
      } catch (err: any) {
        console.error('Lỗi khi tìm sân gần nhất:', err);
        setError(err?.message || 'Đã xảy ra lỗi khi tìm sân gần nhất');
        setLoading(false);
      }
    };

    fetchNearestFields();
  }, [searchParams, navigate]);

  if (loading && !error) {
    return (
      <div className="container mt-5">
        <h2 className="text-center">Đang tìm sân bóng gần nhất...</h2>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Lỗi khi tìm sân gần nhất</h4>
          <p>{error}</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/sportify/field')}
          >
            Quay lại trang sân bóng
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default NearestFieldPage;