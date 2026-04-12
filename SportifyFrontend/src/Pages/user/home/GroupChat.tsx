import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { checkLogin } from "../../../helper/checkLogin";
import "../../../styles/GroupChat.css";

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
let stompClient: any = null;

export default function GroupChat() {
  const { teamId } = useParams<{ teamId: string }>();
  const roomId = teamId || "general";
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [username, setUsername] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeouts = useRef<{ [username: string]: NodeJS.Timeout }>({});
  const [isConnected, setIsConnected] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  // Kiểm tra vị trí scroll để hiển thị/ẩn nút cuộn xuống
  const handleScroll = () => {
    if (chatBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
      setShowScrollDown(scrollTop + clientHeight < scrollHeight - 10);
    }
  };
  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (chatBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        chatBoxRef.current.scrollTop = scrollHeight;
      }
    }
  }, [messages]);
  const connectedRef = useRef(false);

  useEffect(() => {
    const fetchUserAndConnect = async () => {
      const res = await checkLogin();
      if (res.loggedIn && res.username) {
        setUsername(res.username);

        // tạo socket sau khi có username
        const socket = new SockJS(`${URL_BACKEND}/api/user/ws`);
        stompClient = over(socket);

        stompClient.connect({ username: res.username, roomId: roomId }, async () => {
          console.log("✅ Connected to WebSocket");
          setIsConnected(true);
          joinRoom(roomId);
          await loadHistory(roomId);
          await loadOnlineUsers();
        }, (error: any) => {
          console.error("❌ STOMP connection error:", error);
        });
      }
    };
    if (connectedRef.current) return;
    connectedRef.current = true;

    fetchUserAndConnect();
  }, []);

  useEffect(() => {
    if (!stompClient || !isConnected) return;
    const typingSubscription = stompClient.subscribe(`/topic/${roomId}/typing`, (payload: any) => {
      const data = JSON.parse(payload.body);
      // Thêm người dùng vào danh sách đang gõ
      const typingUser = data.username;
      // if (typingUser === username) return; // Không hiển thị typing của chính mình

      setTypingUsers((prev) => {
        if (!prev.includes(typingUser)) {
          return [...prev, typingUser];
        }
        return prev;
      });

      // Nếu đã có timeout thì clear trước khi set lại
      if (typingTimeouts.current[typingUser]) {
        clearTimeout(typingTimeouts.current[typingUser]);
      }
      typingTimeouts.current[typingUser] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter(u => u !== typingUser));
        delete typingTimeouts.current[typingUser];
      }, 2000);
    });

    return () => typingSubscription.unsubscribe();
  }, [isConnected, stompClient]);

  // người dùng nhập
  const handleTyping = () => {
    if (stompClient && stompClient.connected) {
      stompClient.send(`/app/chat.typing/${roomId}`, {}, JSON.stringify({ username }));
    }
  };

  const joinRoom = (room: string) => {
    stompClient.subscribe(`/topic/${room}`, (payload: any) => {
      const msg = JSON.parse(payload.body);
      setMessages((prev) => [...prev, msg]);
    });
  };

  const loadHistory = async (room: string) => {
    const res = await axios.get(`${URL_BACKEND}/api/user/chat/history/${room}`);
    setMessages(res.data);
  };

  const loadOnlineUsers = async () => {
    const res = await axios.get(`${URL_BACKEND}/api/user/online-users`, {
      params: { roomId } // gửi roomId hiện tại
    });
    setOnlineUsers(res.data); // res.data là array user trong room
  };

  const sendMessage = (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() !== "") {
      const chatMessage = { sender: username, content: message };
      stompClient.send(`/app/chat.send/${roomId}`, {}, JSON.stringify(chatMessage));
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
        <span className="fw-bold"><i className="fa fa-comments me-2"></i>Phòng: {roomId}</span>
        <span className="badge bg-success">{onlineUsers.length} online</span>
      </div>
      <div className="card-body p-3">
        <div
          className="mb-3"
          ref={chatBoxRef}
          style={{ height: 400, overflowY: "auto", background: "#f8f9fa", borderRadius: 8, border: "1px solid #eee", position: "relative" }}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="text-center text-muted mt-5">Chưa có tin nhắn nào</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`d-flex mb-2 ${m.sender === username ? "justify-content-end" : "justify-content-start"}`}>
                <div className={`p-2 rounded-3 ${m.sender === username ? "bg-primary text-white" : "bg-light"}`} style={{ maxWidth: "70%" }}>
                  <div className="small fw-bold mb-1">
                    <i className="fa fa-user me-1"></i>{m.sender}
                  </div>
                  <div>{m.content}</div>
                </div>
              </div>
            ))

          )}
          <div className="mb-2" style={{ minHeight: 32 }}>
            {typingUsers.length > 0 && (
              <div className="d-flex align-items-center gap-2" style={{ maxWidth: 260 }}>
                <img src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png" alt="avatar" width="28" height="28" className="rounded-circle border border-2 border-white shadow-sm" />
                <div className="bg-light border rounded-pill px-3 py-1 d-flex align-items-center shadow-sm" style={{ fontSize: '0.97rem', minWidth: 0 }}>
                  <span className="typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                </div>
              </div>
            )}

          </div>
          {showScrollDown && (
            <button
              type="button"
              onClick={scrollToBottom}
              className={`scroll-down-btn ${!showScrollDown ? "hidden" : ""}`}
              aria-label="Cuộn xuống dưới"
            >
              <i className="fa fa-arrow-down"></i>
            </button>
          )}

        </div>

        <form className="d-flex gap-2" onSubmit={sendMessage}>
          <input
            className="form-control"
            value={message}
            placeholder="Nhập tin nhắn..."
            onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(e); }}
            style={{ minWidth: 0 }}
          />
          <button type="submit" className="btn btn-primary px-3">
            <i className="fa fa-paper-plane"></i>
          </button>
        </form>
        <div className="mt-4">
          <h6 className="fw-bold mb-2"><i className="fa fa-users me-2"></i>Người đang online</h6>
          <div className="d-flex flex-wrap gap-2">
            {onlineUsers.length === 0 ? (
              <span className="text-muted">Không có ai online</span>
            ) : (
              onlineUsers.map((u, i) => (
                <span key={i} className="badge bg-success text-white px-2 py-1">{u}</span>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
