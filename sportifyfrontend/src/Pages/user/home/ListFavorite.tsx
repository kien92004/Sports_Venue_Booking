import axios from 'axios';
import { useEffect, useState } from 'react';
import HeroSection from '../../../components/user/Hero';
import getImageUrl from '../../../helper/getImageUrl';

interface Field {
    fieldid: number;
    namefield: string;
    image: string;
    address: string;
    price: number;
    sporttype: {
        categoryname: string;
    };
}

interface FavoriteField {
    id: number;
    username: string;
    field: Field;
}

const ListFavorite = () => {
    const [favorites, setFavorites] = useState<FavoriteField[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [processingIds, setProcessingIds] = useState<number[]>([]);

    const fetchFavorites = async () => {
        try {
            const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.get(`${URL_BACKEND}/api/user/favorite`, { withCredentials: true });
            setFavorites(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching favorite fields:', err);
            setError('Failed to load favorite fields');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemoveFavorite = async (favorite: FavoriteField) => {
        if (processingIds.includes(favorite.field.fieldid)) return;
        if (!window.confirm('Bạn có chắc muốn bỏ sân này khỏi danh sách yêu thích?')) return;

        const fieldId = favorite.field.fieldid;
        const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

        try {
            setProcessingIds(prev => [...prev, fieldId]);
            await axios.delete(`${URL_BACKEND}/api/user/favorite/${fieldId}`, { withCredentials: true });
            setFavorites(prev => prev.filter(item => item.field.fieldid !== fieldId));
        } catch (err) {
            console.error('Error removing favorite field:', err);
            window.alert('Không thể bỏ yêu thích sân này. Vui lòng thử lại.');
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== fieldId));
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="container">
                <div className="alert alert-info" role="alert">
                    Bạn chưa có sân yêu thích nào. Hãy thêm sân vào danh sách yêu thích!
                </div>
            </div>
        );
    }

    return (
        <div>
            <HeroSection
                backgroundImage="/user/images/backgroundField.jpg"
                title="Danh Sách Sân Yêu Thích"
                breadcrumbs={[
                    { label: "Trang Chủ", href: "/sportify" },
                    { label: "Sân", href: "/sportify/field" },
                    { label: "Danh Sách Sân Yêu Thích" }
                ]}
            />
            <section>
                <div className="container mt-5">

                    <div className="row">
                        {favorites.map((favorite) => {
                            const f = favorite.field;

                            return (
                                <div key={f.fieldid} className="col-lg-12 d-flex align-items-stretch mb-3">
                                    <div className="blog-entry d-flex w-100 shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ flexShrink: 0, width: '200px', height: '200px' }}>
                                            <img
                                                className="img"
                                                src={getImageUrl(f.image)}
                                                alt="Image"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="text p-4 bg-light d-flex flex-column" style={{ flex: 1 }}>
                                            <div className="meta mb-2">
                                                <span className="text-info">
                                                    <i className="fa fa-map-marker mr-2"></i>
                                                    {f.address}
                                                </span>
                                            </div>
                                            <h3 className="heading mb-2">
                                                <a
                                                    href={`/sportify/field/detail/${f.fieldid}`}
                                                    className="text-decoration-none text-dark"
                                                    style={{ fontSize: '1.5rem', fontWeight: '600' }}
                                                >
                                                    {f.namefield}
                                                </a>
                                            </h3>
                                            <p className="font-weight-bold mb-2">
                                                Loại sân:{' '}
                                                <span className="text-success">{f.sporttype?.categoryname}</span>
                                            </p>
                                            <div className="d-flex align-items-center justify-content-between mt-auto">
                                                <a href={`/sportify/field/detail/${f.fieldid}`} className="btn btn-success px-4 py-2">
                                                    Chọn sân này
                                                </a>
                                                <span className="text-danger font-weight-bold" style={{ fontSize: '1.25rem' }}>
                                                    {f.price.toLocaleString()} VND
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleRemoveFavorite(favorite)}
                                                    disabled={processingIds.includes(f.fieldid)}
                                                >
                                                    <i className="fa fa-heart mr-2" style={{ color: '#dc3545' }}></i>
                                                    {processingIds.includes(f.fieldid) ? 'Đang xử lý...' : 'Bỏ khỏi yêu thích'}
                                                </button>
                                                <small className="text-muted">Đã thêm vào yêu thích</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default ListFavorite;
