import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "../../styles/ListCard.css";
import SavedCards from './SaveCardBank';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;


// Constants
const API_PAYMENT_BASE = `${URL_BACKEND}/api/user/payment-methods`;

// Interfaces
interface CardData {
    id: string;
    username: string;
    cardNumber: string;
    cardType: string;
    bankCode: string;
    provider?: string;
    cardLast4?: string;
    isDefault: boolean;
    cardHolderName?: string;
    expMonth?: number;
    expYear?: number;
}

interface BankData {
    code: string;
    name: string;
    logo?: string;
    cardType?: string;
}

interface ListCardBankProps {
    username: string;
    showDeleteButton?: boolean; // Optional flag to show/hide delete button
    showDefaultButton?: boolean; // Optional flag to show/hide set default button
    selectedCardId?: string; // ID of the currently selected card
    onCardSelect?: (cardId: string) => void;
}

// Hàm dùng chung để lấy danh sách ngân hàng từ VNPAY API
async function fetchBanksFromVNPay(): Promise<BankData[]> {
    try {
        const API_BANK_LIST = 'https://sandbox.vnpayment.vn/qrpayauth/api/merchant/get_bank_list';
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

const ListCardBank: React.FC<ListCardBankProps> = ({
    username,
    showDeleteButton = true, // Default to showing delete button
    showDefaultButton = true, // Default to showing set default button
    selectedCardId,
    onCardSelect
}) => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [banks, setBanks] = useState<Array<BankData>>([]); // Danh sách ngân hàng

    // Check for return from payment process by keeping the card list in sync
    // useEffect(() => {
    //     if (!username) {
    //         return;
    //     }

    //     loadCards();

    //     // Auto-reload cards every 3 seconds for better sync with backend state
    //     const interval = setInterval(() => {
    //         loadCards();
    //     }, 3000);

    //     return () => clearInterval(interval);
    // }, [username]);

    // Load cards from backend
    const loadCards = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_PAYMENT_BASE}/user/${username}`, {
                withCredentials: true,
            });

            if (response.data) {
                setCards(response.data);
            }
        } catch (err) {
            console.error('Failed to load cards:', err);
            setError('Không thể tải danh sách thẻ. Vui lòng thử lại sau.');
            // In a development environment, you might want to load mock data
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (username) {
            loadCards();
        }

        // Sử dụng hàm fetchBanksFromVNPay chung để tải danh sách ngân hàng
        const loadBankList = async () => {
            try {
                const bankList = await fetchBanksFromVNPay();
                setBanks(bankList);
            } catch (err) {
                console.error('Failed to load bank directory:', err);
            }
        };

        loadBankList();
    }, [username]);

    // Set a card as default
    const setDefaultCard = async (cardId: string) => {
        try {
            await axios.put(`${API_PAYMENT_BASE}/set-default/${cardId}?username=${username}`, {
                withCredentials: true
            });

            // Update local state
            const updatedCards = cards.map(card => ({
                ...card,
                isDefault: card.id === cardId
            }));

            setCards(updatedCards);


        } catch (err) {
            console.error('Failed to set default card:', err);
            setError('Không thể đặt thẻ làm mặc định. Vui lòng thử lại sau.');

            // For development/testing, update local state anyway
            const updatedCards = cards.map(card => ({
                ...card,
                isDefault: card.id === cardId
            }));

            setCards(updatedCards);
        }
    };

    // Delete a card
    const deleteCard = async (cardId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) {
            return;
        }

        try {
            await axios.delete(`${API_PAYMENT_BASE}/${cardId}`, {
                params: { username },
                withCredentials: true
            });

            // Update local state
            const updatedCards = cards.filter(card => card.id !== cardId);
            setCards(updatedCards);

            // Notify parent component if callback provided

        } catch (err) {
            console.error('Failed to delete card:', err);
            setError('Không thể xóa thẻ. Vui lòng thử lại sau.');

            // For development/testing, update local state anyway
            const updatedCards = cards.filter(card => card.id !== cardId);
            setCards(updatedCards);
        }
    };

    return (
        <div className="card-list-container">
            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : (
                <>
                    <h3>Thẻ đã lưu</h3>
                    <SavedCards
                        cards={cards}
                        banks={banks}
                        onSetDefault={showDefaultButton ? setDefaultCard : undefined}
                        onDelete={showDeleteButton ? deleteCard : undefined}
                        selectedCardId={selectedCardId}
                        onCardSelect={onCardSelect}
                    />
                </>
            )}
        </div>
    );
};

export default ListCardBank;
