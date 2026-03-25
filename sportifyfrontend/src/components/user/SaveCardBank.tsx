
import React from 'react';
import "../../styles/CardSelection.css";

// Interfaces needed for SavedCards component
interface CardData {
    id: string;
    username: string;
    cardNumber: string;
    cardType: string;
    bankCode: string;
    isDefault: boolean;
    provider?: string;
    cardLast4?: string;
    cardHolderName?: string;
    expMonth?: number;
    expYear?: number;
}

interface BankData {
    code: string;
    name: string;
    logo?: string;
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

    const VNPAY_BASE_URL = 'https://sandbox.vnpayment.vn';

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

// SavedCards component to display the list of saved cards
interface SavedCardsProps {
    cards: CardData[];
    banks: BankData[];
    onSetDefault?: (cardId: string) => void;
    onDelete?: (cardId: string) => void;
    selectedCardId?: string; // ID of the currently selected card
    onCardSelect?: (cardId: string) => void; // Callback when a card is selected
}

const SavedCards: React.FC<SavedCardsProps> = ({ cards, banks, onSetDefault, onDelete, selectedCardId, onCardSelect }) => {
    if (cards.length === 0) {
        return (
            <div className="no-cards-message">
                Bạn chưa có thẻ nào được lưu. <a href="/sportify/profile/listcard">Tạo thẻ ngay...</a>
            </div>
        );
    }

    return (
        <div className="saved-cards">
            {cards.map(card => (
                <div
                    key={card.id}
                    className={`card-item ${card.isDefault ? 'default-card' : ''} ${selectedCardId === card.id ? 'selected' : ''}`}
                    onClick={() => onCardSelect && onCardSelect(card.id)}
                    style={{ cursor: onCardSelect ? 'pointer' : 'default' }}
                >
                    <div className="card-info">
                        <div className="card-header">
                            {onCardSelect && (
                                <span className="card-select">
                                    <input
                                        type="radio"
                                        name="selectedCard"
                                        checked={selectedCardId === card.id}
                                        onChange={() => onCardSelect(card.id)}
                                        className="mr-2"
                                    />
                                </span>
                            )}
                            <span className="card-brand">
                                {/* Tìm ngân hàng trong danh sách để hiển thị logo */}
                                {(() => {
                                    // Tìm ngân hàng một lần thay vì nhiều lần
                                    const bank = banks.find((b: BankData) => b.code === card.bankCode);
                                    return <BankLogo
                                        bank={bank}
                                        bankCode={card.bankCode}
                                        className="saved-card-logo"
                                        showName={true}
                                    />
                                })()}
                            </span>
                            {card.isDefault && <span className="default-badge">Mặc định</span>}
                        </div>
                        <div className="card-number">
                            {card.cardNumber ? card.cardNumber : (card.cardLast4 ? `•••• •••• •••• ${card.cardLast4}` : 'Số thẻ không có sẵn')}
                        </div>
                        <div className="card-holder">{card.username || card.cardHolderName || 'Chưa có tên'}</div>
                        <div className="card-type">Loại thẻ: {card.cardType || 'Không xác định'}</div>
                        <div className="card-bank-code">Mã ngân hàng: {card.bankCode}</div>
                        {(card.expMonth && card.expYear) &&
                            <div className="card-expiry">Ngày phát hành: {card.expMonth}/{card.expYear}</div>
                        }
                    </div>
                    {/* Only show card actions if at least one button should be displayed */}
                    {(onSetDefault || onDelete) && (
                        <div className="card-actions">
                            {!card.isDefault && onSetDefault && (
                                <button onClick={() => onSetDefault(card.id)} className="default-btn">
                                    Đặt làm mặc định
                                </button>
                            )}
                            {onDelete && (
                                <button onClick={() => onDelete(card.id)} className="delete-btn">
                                    Xóa
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SavedCards;