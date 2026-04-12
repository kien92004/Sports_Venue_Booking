import type { ReactNode } from "react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: number;
  username: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (message: string, type: NotificationType) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  removeNotification: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const API_BASE = `${BACKEND_URL}/api/user/notifications`;
const DEFAULT_FETCH_INIT: RequestInit = {
  credentials: "include",
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const username = useMemo(() => user?.username ?? "", [user]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!username) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}?username=${encodeURIComponent(username)}`, {
          ...DEFAULT_FETCH_INIT,
        });
        if (!res.ok) {
          throw new Error(`Failed to load notifications (${res.status})`);
        }
        const data: Notification[] = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();
  }, [username]);

  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.read).length,
    [notifications]
  );

  const addNotification = async (message: string, type: NotificationType) => {
    if (!username) return;
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, message, type }).toString(),
        ...DEFAULT_FETCH_INIT,
      });
      if (!res.ok) {
        throw new Error(`Failed to add notification (${res.status})`);
      }
      const created: Notification = await res.json();
      setNotifications(prev => [created, ...prev]);
    } catch (error) {
      console.error("Error adding notification", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/read`, {
        method: "PUT",
        ...DEFAULT_FETCH_INIT,
      });
      if (!res.ok) {
        throw new Error(`Failed to mark notification as read (${res.status})`);
      }
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    if (!username) return;
    try {
      const res = await fetch(`${API_BASE}/mark-all-read?username=${encodeURIComponent(username)}`, {
        method: "PUT",
        ...DEFAULT_FETCH_INIT,
      });
      if (!res.ok) {
        throw new Error(`Failed to mark notifications as read (${res.status})`);
      }
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read", error);
    }
  };

  const removeNotification = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        ...DEFAULT_FETCH_INIT,
      });
      if (!res.ok) {
        throw new Error(`Failed to delete notification (${res.status})`);
      }
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error("Error removing notification", error);
    }
  };

  const clearNotifications = async () => {
    if (!username) {
      setNotifications([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/clear?username=${encodeURIComponent(username)}`, {
        method: "DELETE",
        ...DEFAULT_FETCH_INIT,
      });

      if (!res.ok) {
        throw new Error(`Failed to clear notifications (${res.status})`);
      }

      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};