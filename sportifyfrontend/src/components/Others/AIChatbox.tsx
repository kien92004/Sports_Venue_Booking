import React, { useRef, useState } from "react";
import getImageUrl from "../../helper/getImageUrl";
import "../../styles/AIChatbox.css";
import "../../styles/AIChatInputWithMedia.css";
import "../../styles/GroupChat.css";
import CustomCard from "../user/CustomCard";
import AIChatInputWithMedia from "./AIChatInputWithMedia";
// Use VITE_BACKEND_URL for backend API calls
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

type Message = {
  role: "user" | "bot" | "typing";
  text?: string;
  fieldData?: any;
  shiftData?: any;
  bookingData?: any;
  unknownData?: any;
  infoNeededData?: any;
  productListData?: any;
  singleProductData?: any;
  orderProductData?: any;
};

// Type definition for API responses
interface Field {
  fieldid: number;
  namefield: string;
  descriptionfield: string;
  address: string;
  price: number;
  image: string;
  sporttype: {
    sporttypeid: string;
    categoryname: string;
  };
  status: boolean;
}

interface Shift {
  shiftid: number;
  timeStart: string;
  timeEnd: string;
  nameshift?: string;
  price?: number;
}

// Updated interface for the new shift response format
interface AvailableShiftsResponse {
  fieldId: number;
  fieldName: string;
  date: string;
  message: string;
  availableShifts: Shift[];
}

interface BookingResponse {
  fieldName: string;
  date: string;
  time: string;
  redirectUrl: string;
  message: string;
}


// Product interfaces
interface Category {
  categoryid: number;
  categoryname: string;
}

interface Product {
  productid: number;
  productname: string;
  image: string;
  price: number;
  discountprice: number;
  quantity: number;
  descriptions: string;
  productstatus: boolean;
  datecreate: string;
  categories: Category;
  categoryid: number;
}

interface ProductListResponse {
  message: string;
  products: Product[];
}

interface SingleProductResponse {
  message: string;
  product: Product;
}

interface OrderProductResponse {
  message: string;
  quantity: number;
  redirectUrl: string;
  product: Product;
}

// Field list component
const FieldList: React.FC<{ fields: Field[] }> = ({ fields }) => {
  return (
    <div className="ai-field-grid">
      {fields.map((field) => (
        <div key={field.fieldid} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CustomCard
            id={field.fieldid}
            title={field.namefield}
            image={getImageUrl(field.image)}
            link={`/sportify/field/detail/${field.fieldid}`}
            badgeText={field.sporttype.categoryname}
            badgeColor="bg-success"
            extraInfo={
              <div>
                <div><i className="fas fa-map-marker-alt me-1"></i>{field.address}</div>
                <div className="mt-1 fw-bold text-primary">
                  <i className="fas fa-tag me-1"></i>{field.price.toLocaleString('vi-VN')}đ/giờ
                </div>
              </div>
            }
            buttonText="Xem chi tiết"
          />
        </div>
      ))}
    </div>
  );
};

// New component for displaying available shifts
const AvailableShifts: React.FC<{ data: AvailableShiftsResponse }> = ({ data }) => {
  return (
    <div className="ai-shifts-container">
      <div className="fw-bold mb-2">{data.message}</div>
      <div className="text-muted mb-2">Sân: {data.fieldName} - Ngày: {data.date}</div>

      <div className="ai-shifts-list">
        {data.availableShifts.map(shift => (
          <div key={shift.shiftid} className="ai-shift-card">
            <div className="ai-shift-time">{shift.timeStart} - {shift.timeEnd}</div>
            <div className="ai-shift-name">{shift.nameshift || `Ca ${shift.shiftid}`}</div>
            {shift.price && <div className="text-primary fw-bold">{shift.price.toLocaleString('vi-VN')}đ</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Component for groups of shifts - keeping for backward compatibility
const ShiftGroups: React.FC<{ data: any }> = ({ data }) => {
  // Handle both old and new format
  if (data.availableShifts) {
    return <AvailableShifts data={data} />;
  }

  return (
    <div>
      <div className="fw-bold mb-2">{data.message}</div>
      <div className="text-muted mb-2">Sân: {data.fieldName} - Ngày: {data.date}</div>

      {data.availableShiftGroups?.map((group: any, index: number) => (
        <div key={index} className="ai-shift-group">
          <div className="fw-bold mb-2">Nhóm ca {index + 1}:</div>
          {group.map((shift: any) => (
            <div key={shift.shiftid} className="ai-shift-item">
              <div>{shift.timeStart} - {shift.timeEnd}</div>
              <div className="text-primary fw-bold">{shift.nameshift}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Booking info component
const BookingInfo: React.FC<{ data: BookingResponse }> = ({ data }) => {
  React.useEffect(() => {
    // Redirect after showing message
    const timer = setTimeout(() => {
      window.location.href = data.redirectUrl;
    }, 3000);
    return () => clearTimeout(timer);
  }, [data.redirectUrl]);

  return (
    <div className="ai-book-info">
      <div className="fw-bold">{data.message}</div>
      <div>Sân: {data.fieldName}</div>
      <div>Ngày: {data.date}</div>
      <div>Giờ: {data.time}</div>
      <div className="mt-2">
        <a href={data.redirectUrl} className="btn btn-sm btn-primary">
          Đặt ngay
        </a>
      </div>
    </div>
  );
};

// Modify the ProductList component to use our newly created grid
const ProductList: React.FC<{ data: ProductListResponse }> = ({ data }) => {
  return (
    <div className="ai-product-list">
      <div className="fw-bold mb-2">{data.message}</div>
      <div className="ai-product-grid">
        {data.products.map(product => (
          <CustomCard
            key={product.productid}
            id={product.productid}
            title={product.productname}
            image={getImageUrl(product.image)}
            link={`/sportify/product/detail/${product.productid}`}
            badgeText={product.categories.categoryname}
            badgeColor="bg-info"
            extraInfo={
              <div>
                <div className="mt-1 fw-bold text-primary">
                  <i className="fas fa-tag me-1"></i>
                  {product.discountprice > 0 ? (
                    <>
                      <span className="text-decoration-line-through text-muted me-2">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span>{product.discountprice.toLocaleString('vi-VN')}đ</span>
                    </>
                  ) : (
                    <span>{product.price.toLocaleString('vi-VN')}đ</span>
                  )}
                </div>
                <div><i className="fas fa-cubes me-1"></i>Còn {product.quantity} sản phẩm</div>
              </div>
            }
            buttonText="Xem chi tiết"
          />
        ))}
      </div>
    </div>
  );
};

// Single product component
const SingleProduct: React.FC<{ data: SingleProductResponse }> = ({ data }) => {
  return (
    <div className="ai-single-product">
      <div className="fw-bold mb-2">{data.message}</div>
      <div className="ai-product-card">
        <div className="ai-product-img">
          <img src={getImageUrl(data.product.image)} alt={data.product.productname} />
        </div>
        <div className="ai-product-info">
          <h5>{data.product.productname}</h5>
          <div className="ai-product-price">
            {data.product.discountprice > 0 ? (
              <>
                <span className="text-decoration-line-through text-muted me-2">
                  {data.product.price.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-primary fw-bold">
                  {data.product.discountprice.toLocaleString('vi-VN')}đ
                </span>
              </>
            ) : (
              <span className="text-primary fw-bold">
                {data.product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
          <div className="ai-product-meta">
            <div><i className="fas fa-box me-1"></i>Loại: {data.product.categories.categoryname}</div>
            <div><i className="fas fa-cubes me-1"></i>Còn: {data.product.quantity} sản phẩm</div>
          </div>
          <div className="mt-2">
            <a href={`/sportify/product/detail/${data.product.productid}`} className="btn btn-sm btn-primary">
              Xem chi tiết
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order product component
const OrderProduct: React.FC<{ data: OrderProductResponse }> = ({ data }) => {
  React.useEffect(() => {
    // Redirect after showing message
    const timer = setTimeout(() => {
      window.location.href = data.redirectUrl;
    }, 3000);
    return () => clearTimeout(timer);
  }, [data.redirectUrl]);

  return (
    <div className="ai-order-product">
      <div className="fw-bold">{data.message}</div>
      <div className="ai-order-details">
        <div><b>Sản phẩm:</b> {data.product.productname}</div>
        <div><b>Số lượng:</b> {data.quantity}</div>
        <div className="ai-product-price mt-1">
          <b>Giá:</b> {' '}
          {data.product.discountprice > 0 ? (
            <>
              <span className="text-decoration-line-through text-muted me-2">
                {data.product.price.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-primary fw-bold">
                {data.product.discountprice.toLocaleString('vi-VN')}đ
              </span>
            </>
          ) : (
            <span className="text-primary fw-bold">
              {data.product.price.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
      </div>
      <div className="mt-2">
        <a href={data.redirectUrl} className="btn btn-sm btn-primary">
          Đến trang thanh toán
        </a>
      </div>
    </div>
  );
};

// Typing indicator component that matches GroupChat styling
const TypingIndicator: React.FC = () => {
  return (
    <div className="ai-typing-container">
      <div className="ai-typing-bubble">
        <div className="typing-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

const AIChatbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string>("");

  // Quick replies suggestions
  const quickReplies = [
    "🛍️ Sản phẩm nào tốt?",
    "🏟️ Cho thuê sân",
    "⚽ Sự kiện gần đây",
    "📞 Liên hệ với tôi"
  ];

  // Initialize userId from localStorage
  React.useEffect(() => {
    let storedUserId = localStorage.getItem("aichatbox_userId");
    if (!storedUserId) {
      // Generate a unique userId if not exists
      storedUserId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("aichatbox_userId", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Load messages from localStorage on mount
  // Track if we've loaded from database
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const loadInitialMessages = async () => {
      const savedMessages = localStorage.getItem("aichatbox_messages");
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error("Error loading messages from localStorage:", error);
        }
      } else {
        // Only load from database if localStorage is empty
        await loadChatHistoryFromDatabase();
      }
      setIsLoaded(true);
    };

    loadInitialMessages();
  }, []);

  // Save messages to localStorage whenever they change (but only after initial load)
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("aichatbox_messages", JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  // Load chat history from database
  const loadChatHistoryFromDatabase = async () => {
    if (!userId) return; // Wait until userId is set

    try {
      const res = await fetch(`${URL_BACKEND}/sportify/rest/ai/history/get-history?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();

      if (data.status === "success" && data.data && data.data.length > 0) {
        // Convert database format to frontend format
        const dbMessages = data.data.map((item: any) => {
          try {
            const parsedData = item.messageData ? JSON.parse(item.messageData) : {};
            return {
              role: item.role,
              text: item.message || item.response,
              ...parsedData
            };
          } catch {
            return {
              role: item.role,
              text: item.message || item.response
            };
          }
        });

        // Load from database only if localStorage is empty
        setMessages(dbMessages);
      }
    } catch (error) {
      console.error("Error loading chat history from database:", error);
    }
  };

  // Save message to database
  const saveMessageToDatabase = async (msg: string, response: any, role: string) => {
    if (!userId) return; // Wait until userId is set

    try {
      await fetch(`${URL_BACKEND}/sportify/rest/ai/history/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          message: msg,
          response: typeof response === 'string' ? response : JSON.stringify(response),
          role: role,
          messageData: JSON.stringify(response)
        })
      });
    } catch (error) {
      console.error("Error saving message to database:", error);
    }
  };

  React.useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open, isLoading]);

  const appendUserMessage = (text: string) => {
    setMessages((msgs) => [...msgs, { role: "user", text }]);
  };

  const appendBotMessage = (responseData: any) => {
    // Remove typing indicator first
    setIsLoading(false);

    // Nếu response là string, xử lý riêng
    if (typeof responseData === 'string') {
      setMessages((msgs) => [...msgs, { role: "bot", text: responseData }]);
      return;
    }

    // Xác định loại message
    let newMessage: any = { role: "bot" };

    switch (true) {
      case !!responseData.fields:
        newMessage.fieldData = responseData;
        break;

      case !!responseData.availableShifts || !!responseData.availableShiftGroups:
        newMessage.shiftData = responseData;
        break;

      case !!responseData.redirectUrl && !!responseData.fieldName:
        newMessage.bookingData = responseData;
        break;

      case !!responseData.products:
        newMessage.productListData = responseData;
        break;

      case !!responseData.product && !responseData.redirectUrl:
        newMessage.singleProductData = responseData;
        break;

      case !!responseData.product && !!responseData.redirectUrl:
        newMessage.orderProductData = responseData;
        break;

      case responseData.action === "UNKNOWN":
        newMessage.unknownData = responseData;
        break;

      case !!responseData.message && !responseData.action:
        newMessage.infoNeededData = responseData;
        break;

      default:
        newMessage.text = JSON.stringify(responseData);
    }

    setMessages((msgs) => [...msgs, newMessage]);
  };


  const ask = async (msg: string, attachments: File[] = []) => {
    // Validate message is not empty
    if (!msg || !msg.trim()) {
      console.warn("Message is empty, not sending");
      return;
    }

    appendUserMessage(msg);
    // Save user message to database
    await saveMessageToDatabase(msg, null, "user");

    // setInput("");  // input state not currently used in this component
    setIsLoading(true);

    try {
      // Prepare FormData if there are attachments
      const formData = new FormData();
      formData.append("message", msg.trim());

      // Add files to FormData
      attachments.forEach((file) => {
        formData.append("files", file);
      });

      // Sử dụng endpoint product-chat cho AI thân thiện + gợi ý sản phẩm
      const res = await fetch(`${URL_BACKEND}/sportify/rest/ai/product-chat`, {
        method: "POST",
        body: attachments.length > 0 ? formData : JSON.stringify({ message: msg }),
        headers: attachments.length > 0
          ? undefined
          : { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("Product Chat Response:", data);

      if (data && data.reply) {
        // Nếu reply là HTML, hiển thị nó trực tiếp
        if (typeof data.reply === 'string' && data.reply.includes('<')) {
          setMessages((msgs) => [...msgs, { role: "bot", text: data.reply }]);
          // Save bot response to database
          await saveMessageToDatabase(msg, data.reply, "bot");
        } else {
          appendBotMessage(data.reply);
          // Save bot response to database
          await saveMessageToDatabase(msg, data.reply, "bot");
        }
      } else {
        const fallbackMsg = "Xin lỗi, hiện chưa nhận được phản hồi.";
        appendBotMessage(fallbackMsg);
        // Save bot response to database
        await saveMessageToDatabase(msg, fallbackMsg, "bot");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = "Lỗi kết nối đến AI.";
      appendBotMessage(errorMsg);
      // Save error message to database
      await saveMessageToDatabase(msg, errorMsg, "bot");
    } finally {
      setIsLoading(false);
    }
  };

  // Render a message based on its type
  const renderMessage = (message: Message, index: number) => {
    const renderBotContent = (content: React.ReactNode, extraClass = "") => (
      <div key={index} className={`ai-msg ai-bot ${extraClass}`}>
        <div className="ai-msg-content">{content}</div>
      </div>
    );

    if (message.role === "user") {
      return (
        <div key={index} className="ai-msg ai-user">
          <div className="ai-msg-content">{message.text}</div>
        </div>
      );
    }

    if (message.role === "typing") {
      return <TypingIndicator key={index} />;
    }

    // Bot responses
    if (message.text) {
      if (message.text.includes("<")) {
        return (
          <div key={index} className="ai-msg ai-bot">
            <div
              className="ai-msg-content ai-html-content"
              dangerouslySetInnerHTML={{ __html: message.text }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === "A") {
                  const href = target.getAttribute("href");
                  if (href) {
                    if (href.startsWith("/")) window.location.href = href;
                    else if (href.startsWith("http")) window.open(href, "_blank");
                    e.preventDefault();
                  }
                }
              }}
            />
          </div>
        );
      }
      return renderBotContent(message.text);
    }

    if (message.fieldData) return renderBotContent(<FieldList fields={message.fieldData.fields} />);
    if (message.shiftData) return renderBotContent(<ShiftGroups data={message.shiftData} />);
    if (message.bookingData) return renderBotContent(<BookingInfo data={message.bookingData} />);
    if (message.productListData) return renderBotContent(<ProductList data={message.productListData} />);
    if (message.singleProductData) return renderBotContent(<SingleProduct data={message.singleProductData} />);
    if (message.orderProductData) return renderBotContent(<OrderProduct data={message.orderProductData} />);
    if (message.unknownData) return renderBotContent(message.unknownData.message, "ai-unknown");
    if (message.infoNeededData) return renderBotContent(message.infoNeededData.message, "ai-info-needed");

    return null;
  };

  return (
    <>
      <div
        className="ai-chat-fab"
        title="Chat với AI"
        onClick={() => setOpen((o) => !o)}
        style={{ display: open ? "none" : "flex" }}
      >
        💬
      </div>
      <div
        className="ai-chat-panel"
        style={{ display: open ? "flex" : "none", flexDirection: "column" }}
      >
        <div className="ai-chat-header">
          <span>Sportify AI</span>
          <div className="ai-header-actions">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat?")) {
                    setMessages([]);
                    localStorage.removeItem("aichatbox_messages");
                  }
                }}
                aria-label="Xóa lịch sử"
                title="Xóa lịch sử chat"
                className="ai-clear-btn"
              >
                🗑️
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng"
            >
              ×
            </button>
          </div>
        </div>
        <div className="ai-chat-body" ref={bodyRef}>
          {messages.length === 0 ? (
            <div className="ai-welcome-container">
              <div className="ai-welcome-emoji">👋</div>
              <div className="ai-welcome-title">
                Xin chào! Tôi là Sportify AI
              </div>
              <div className="ai-welcome-text">
                Hỏi tôi về sản phẩm, sân, đội hoặc bất cứ điều gì!
              </div>
              <div className="ai-quick-replies">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    className="ai-quick-reply"
                    onClick={() => ask(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => renderMessage(message, index))}
              {isLoading && <TypingIndicator />}
            </>
          )}
        </div>
        <AIChatInputWithMedia
          onSendMessage={ask}
          onStartRecording={() => console.log("Recording started")}
          onStopRecording={() => console.log("Recording stopped")}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default AIChatbox;
