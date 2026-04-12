import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { FieldUsage } from '../../Types/interface';
import getImageUrl from '../../helper/getImageUrl';
import '../../styles/FieldManagement.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
const ManggerFileActive: React.FC = () => {
    const [fields, setFields] = useState<FieldUsage[]>([]);
    const [filteredFields, setFilteredFields] = useState<FieldUsage[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch dữ liệu từ API
    const fetchFieldData = async (date: string) => {
        try {
            setLoading(true);
            const response = await fetch(
                `${URL_BACKEND}/api/field-usage/active-fields/list-fields?date=${date}`
            );
            if (response.ok) {
                const data = await response.json();
                setFields(data);
                setFilteredFields(data);
            } else {
                console.error('Failed to fetch field data');
            }
        } catch (error) {
            console.error('Error fetching field data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Lọc dữ liệu theo tên sân
    const filterFields = () => {
        const filtered = fields.filter(field =>
            field.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFields(filtered);
    };

    // Effect để fetch dữ liệu khi component mount hoặc date thay đổi
    useEffect(() => {
        fetchFieldData(selectedDate);
    }, [selectedDate]);

    // Effect để lọc khi search term thay đổi
    useEffect(() => {
        filterFields();
    }, [searchTerm, fields]);

    // Xử lý thay đổi ngày
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

    // Xử lý tìm kiếm
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Làm mới dữ liệu
    const refreshData = () => {
        fetchFieldData(selectedDate);
    };

    // Component card cho mỗi sân
    const FieldCard: React.FC<{ field: FieldUsage }> = ({ field }) => {
        const hasBookings = field.totalBookings > 0;
        return (
            <div className={`card h-100 shadow-sm border-0 position-relative ${hasBookings ? '' : 'bg-light'}`}
                style={{ background: hasBookings ? '#b9f4b3ff' : '#383838ff', border: '1px solid ' + (hasBookings ? '#28a745' : '#717171ff') }}>
                {/* Nhãn số lượt đặt */}
                <span
                    className={`badge position-absolute top-0 end-0 m-2 px-3 py-2 ${hasBookings ? 'bg-success' : 'bg-secondary'} text-white`}
                    style={{ fontSize: '0.95rem', zIndex: 2 }}
                >
                    {hasBookings ? `${field.totalBookings} lượt đặt` : 'Chưa có đặt'}
                </span>
                <img
                    className="card-img-top"
                    src={getImageUrl(field.fieldImage)}
                    alt={field.fieldName}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/default-field.jpg';
                    }}
                    style={{ borderRadius: '12px 12px 0 0', height: '180px', objectFit: 'cover', background: '#fafbfc' }}
                />
                <div className="card-body">
                    <NavLink to={`/admin/manager-file-active-detail/${field.fieldId}`} className="text-decoration-none">
                        <h5 className="card-title fw-bold mb-2 text-dark">{field.fieldName}</h5>
                        <p className="mb-2">
                            <span className="fw-semibold ">Giá sân:</span>{' '}
                            <span>{field.fieldPrice.toLocaleString('vi-VN')} VND</span>
                        </p>
                        <div className="row mb-2">
                            <div className="col-6">
                                <span className="fw-semibold ">Đặt lẻ:</span>{' '}
                                <span>{field.oneTimeBookings}</span>
                            </div>
                            <div className="col-6">
                                <span className="fw-semibold ">Đặt cố định:</span>{' '}
                                <span>{field.permanentBookings}</span>
                            </div>
                        </div>
                        <div className="row mb-2">
                            <div className="col-6">
                                <span className="fw-semibold ">Doanh thu:</span>{' '}
                                <br />
                                <span className="fw-bold" style={{ color: '#6c757d' }}>
                                    {field.totalRevenue.toLocaleString('vi-VN')} VND
                                </span>
                            </div>
                            <div className="col-6">
                                <span className="fw-semibold ">Lượt đặt:</span>{' '}
                                <span>{field.totalBookings}</span>
                            </div>
                        </div>
                    </NavLink>
                </div>
            </div>
        );
    };

    return (
        <div className=" page-wrapper py-4">
            <div className=" bg-white rounded shadow-sm p-4">
                <div className="page-header">
                    <h1>Quản lý trạng thái sân</h1>
                    <p>Theo dõi tình hình đặt sân và doanh thu theo ngày</p>
                </div>

                {/* Bộ lọc và tìm kiếm */}
                <div className="row">
                    <div className="filter-group col-md-4 col-sm-6 mb-3">
                        <label htmlFor="date-picker">Ngày:</label>
                        <input
                            id="date-picker"
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="date-input"
                        />
                    </div>

                    <div className="filter-group col-md-6 col-sm-6 mb-3">
                        <label htmlFor="search-input">Tìm kiếm sân:</label>
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Nhập tên sân..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>
                    <div className='col-md-2 col-sm-12 d-flex align-items-end justify-content-end mb-3'>

                        <button onClick={refreshData} className="btn btn-primary refresh-button ">
                            🔄 Làm mới
                        </button>
                    </div>
                </div>

                {/* Thống kê tổng quan */}
                <div className="summary-stats">
                    <div className="summary-item">
                        <span className="summary-label">Tổng số sân:</span>
                        <span className="summary-value">{filteredFields.length}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Sân có đặt:</span>
                        <span className="summary-value active">
                            {filteredFields.filter(f => f.totalBookings > 0).length}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Tổng lượt đặt:</span>
                        <span className="summary-value inactive">
                            {filteredFields.reduce((sum, f) => sum + f.totalBookings, 0)}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Tổng doanh thu:</span>
                        <span className="summary-value revenue">
                            {filteredFields.reduce((sum, f) => sum + f.totalRevenue, 0).toLocaleString('vi-VN')} VND
                        </span>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                )}

                {/* Lưới hiển thị sân */}
                {!loading && (
                    <div className="row g-4">
                        {filteredFields.length > 0 ? (
                            filteredFields.map((field) => (
                                <div key={field.fieldId} className="col-lg-4 col-md-6">
                                    <FieldCard field={field} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-info text-center">Không có sân nào phù hợp với tiêu chí tìm kiếm</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManggerFileActive;
