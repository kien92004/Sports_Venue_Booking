import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ListCardBank from '../../../components/user/ListCardBank';
import "../../../styles/ListCard.css";

interface BankData {
    code: string;
    name: string;
    logo?: string;
    cardType?: string;
}

// Constants
const VNPAY_BASE_URL = 'https://sandbox.vnpayment.vn';
const API_BANK_LIST = 'https://sandbox.vnpayment.vn/qrpayauth/api/merchant/get_bank_list';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
const API_GENERATE_TOKEN = `${URL_BACKEND}/api/user/generate-token`;


const CARD_TYPE_MAP: Record<string, string> = {
    "01": "Thẻ ATM nội địa",
    "02": "Thẻ quốc tế (Visa/Master/JCB)",
    "03": "Tài khoản ngân hàng",
    "04": "Internet Banking",
    "05": "QR Code (VNPAY-QR)",
    "06": "Ví điện tử (E-Wallet)",
    "07": "POS / NFC",
};

interface BankData {
    code: string;
    name: string;
    logo?: string;
    cardType?: string;
}

// Component hiển thị logo ngân hàng
const BankLogo: React.FC<{
    bank?: BankData;
    bankCode?: string;
    className?: string;
    showName?: boolean;
}> = ({ bank, bankCode, className = 'bank-logo', showName = false }) => {
    if (!bank && !bankCode) {
        return <span className="bank-placeholder">VNPAY</span>;
    }

    const code = bank?.code || bankCode || '';
    const name = bank?.name || code;
    const logo = bank?.logo;

    return (
        <>
            {logo ? (
                <img
                    src={logo.startsWith('~') ? `${VNPAY_BASE_URL}${logo.substring(1)}` : logo}
                    alt={name}
                    className={className}
                />
            ) : (
                <div className="bank-logo-placeholder">{code}</div>
            )}
            {showName && <span className="bank-name">{name}</span>}
        </>
    );
};

interface CardFormProps {
    username: string;
    banks: BankData[];
    isLoadingBanks: boolean;
}

interface CardFormProps {
    username: string;
    banks: BankData[];
    isLoadingBanks: boolean;
}

// Component for adding a new card
const CardForm: React.FC<CardFormProps> = ({ username, banks, isLoadingBanks }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [bankCode, setBankCode] = useState('');
    const [cardType, setCardType] = useState('CREDIT');
    const [searchBank, setSearchBank] = useState('');
    const [filteredBanks, setFilteredBanks] = useState<Array<BankData>>([]);

    // Filter banks whenever search term or bank list changes
    useEffect(() => {
        if (!searchBank.trim()) {
            setFilteredBanks(banks);
        } else {
            const searchTerm = searchBank.toLowerCase();
            const filtered = banks.filter(bank =>
                bank.name.toLowerCase().includes(searchTerm) ||
                bank.code.toLowerCase().includes(searchTerm)
            );
            setFilteredBanks(filtered);
        }
    }, [searchBank, banks]);

    // Không cần gọi fetchBanks nữa vì đã được cung cấp qua props

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!bankCode) {
            setError('Vui lòng chọn ngân hàng');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Send data to backend to get redirect URL
            const response = await axios.post(`${API_GENERATE_TOKEN}`, null, {
                params: {
                    username: username,
                    cardType: cardType,
                    bankCode: bankCode
                },
                withCredentials: true
            });


            // If response contains a URL, redirect to it
            if (response.data) {
                // Redirect to the payment URL
                window.location.href = response.data.url;
            } else {
                throw new Error('Không nhận được URL thanh toán từ máy chủ');
            }
        } catch (err: any) {
            console.error('Payment Method Error:', err);
            setError(err.message || 'Có lỗi xảy ra khi tạo phiên thanh toán');
            setLoading(false);
        }
    };

    return (
        <div className="card-form">
            <h3>Thêm thẻ mới</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="bankCode">Ngân hàng</label>
                    {isLoadingBanks ? (
                        <select disabled className="bank-select">
                            <option value="">Đang tải danh sách ngân hàng...</option>
                        </select>
                    ) : (
                        <>
                            {/* Search input for banks */}
                            <div className="bank-search-container">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm ngân hàng..."
                                    value={searchBank}
                                    onChange={(e) => setSearchBank(e.target.value)}
                                    className="bank-search-input"
                                />
                                {searchBank && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={() => setSearchBank('')}
                                        type="button"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <div className="bank-selector-container">
                                <select
                                    id="bankCode"
                                    value={bankCode}
                                    onChange={(e) => setBankCode(e.target.value)}
                                    required
                                    className="bank-select"
                                >
                                    <option value="">Chọn ngân hàng</option>
                                    {filteredBanks.map(bank => (
                                        <option key={bank.code} value={bank.code}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Display bank logos as clickable options */}
                            <div className="bank-logo-container">
                                {filteredBanks.length === 0 ? (
                                    <div className="no-results">Không tìm thấy ngân hàng phù hợp</div>
                                ) : (
                                    <>
                                        {filteredBanks.slice(0, 8).map(bank => (
                                            <div
                                                key={bank.code}
                                                className={`bank-logo-item ${bankCode === bank.code ? 'selected' : ''}`}
                                                onClick={() => setBankCode(bank.code)}
                                            >
                                                <BankLogo bank={bank} className="bank-logo" />
                                                <span className="bank-name-tooltip">{bank.name}</span>
                                            </div>
                                        ))}
                                        {filteredBanks.length > 8 && (
                                            <div className="more-banks-hint">+ {filteredBanks.length - 8} ngân hàng khác</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="cardType">Kiểu thẻ</label>
                    <select
                        id="cardType"
                        value={cardType}
                        onChange={(e) => setCardType(e.target.value)}
                        required
                        className="card-type-select"
                    >
                        {Object.entries(CARD_TYPE_MAP).map(([code, name]) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading || isLoadingBanks}
                    className="save-card-button"
                >
                    {loading ? 'Đang xử lý...' : isLoadingBanks ? 'Đang tải...' : 'Tiên hành tạo thẻ'}
                </button>

                {error && <div className="error-message">{error}</div>}
            </form>
        </div>
    );
};

// SavedCards component now imported from './saveCard'

// Main Manager component
const ManagerCardBank: React.FC = () => {
    const [username, setUsername] = useState(''); // Would typically come from auth context
    const [banks, setBanks] = useState<Array<BankData>>([]); // Danh sách ngân hàng
    const [loadingBanks, setLoadingBanks] = useState(true); // Trạng thái tải danh sách ngân hàng

    // Initial load
    useEffect(() => {
        // Get username from localStorage or context - implement according to your auth system
        const storedUsername = localStorage.getItem('username') || 'defaultUser';
        setUsername(storedUsername);

        // Sử dụng hàm fetchBanksFromVNPay chung để tải danh sách ngân hàng
        const loadBankList = async () => {
            setLoadingBanks(true);
            try {
                const bankList = await fetchBanksFromVNPay();
                setBanks(bankList);
            } catch (err) {
                console.error('Failed to load bank directory:', err);
            } finally {
                setLoadingBanks(false);
            }
        };

        loadBankList();
    }, []);

    // Hàm dùng chung để lấy danh sách ngân hàng từ VNPAY API
    async function fetchBanksFromVNPay(): Promise<BankData[]> {
        try {
            const response = await fetch(API_BANK_LIST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    tmn_code: '2QXUI4J4', // mã demo của VNPAY Sandbox
                }),
            });
            const responseData = await response.json();

            if (Array.isArray(responseData)) {
                return responseData.map((bank: any) => ({
                    code: bank.bank_code,
                    name: bank.bank_name,
                    logo: bank.logo_link,
                    cardType: bank.card_type
                }));
            } else if (responseData.data && Array.isArray(responseData.data)) {
                return responseData.data.map((bank: any) => ({
                    code: bank.bank_code || bank.bankCode || bank.code,
                    name: bank.bank_name || bank.bankName || bank.name,
                    logo: bank.logo_link || bank.logoLink || bank.logo
                }));
            }
            return [];
        } catch (err) {
            console.error('Failed to load bank list:', err);
            return [
                { code: 'NCB', name: 'Ngân hàng NCB' },
                { code: 'VNPAYQR', name: 'VNPAYQR' },
                { code: 'VNBANK', name: 'LOCAL BANK' },
                { code: 'INTCARD', name: 'INTERNATIONAL CARD' },
                { code: 'VISA', name: 'VISA/MASTER' }
            ];
        }
    }



    return (
        <div className="list-card-container">
            <div className="list-card-heading">
                <h2>Quản lý thẻ thanh toán</h2>
                <p>Quản lý, thêm mới và thiết lập thẻ mặc định cho tài khoản thanh toán của bạn.</p>
            </div>

            <div className="card-list">
                {/* Extracted ListCardBank component */}
                <ListCardBank
                    username={username}
                />

                <div className="add-new-card">
                    <CardForm
                        username={username}
                        banks={banks}
                        isLoadingBanks={loadingBanks}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManagerCardBank;
