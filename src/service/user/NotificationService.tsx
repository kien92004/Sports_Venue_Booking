// Notification Service for handling notifications
import { useNotification } from "../../helper/NotificationContext";

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

// Tạo thông báo từ client
export const createNotification = (message: string, type: "success" | "error" | "info" | "warning") => {
  // Lấy hàm addNotification từ context
  const { addNotification } = useNotification();
  addNotification(message, type);
};

// Gửi thông báo đến server để lưu trữ
export const sendNotificationToServer = async (message: string, type: string) => {
  try {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('type', type);

    const response = await fetch(`${URL_BACKEND}/api/notifications/create`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    return await response.json();
  } catch (error) {
    console.error('Error sending notification to server:', error);
    return { success: false, error };
  }
};

// Kiểm tra xem có thông báo mới không (có thể mở rộng thêm)
export const checkForNewNotifications = async () => {
  // Implement logic để kiểm tra thông báo mới từ server
  // Ví dụ:
  // const response = await fetch(`${URL_BACKEND}/api/notifications/check`, ...);
  // return await response.json();
};