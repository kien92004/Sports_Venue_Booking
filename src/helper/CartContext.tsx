import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { getCartQuantity } from "./checkQuatityCart";

interface CartContextType {
  cartCount: number;
  updateCartCount: () => Promise<void>;
  incrementCartCount: (quantity: number) => void;
  decrementCartCount: (quantity: number) => void;
  resetCartCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState<number>(0);

  // Tải số lượng giỏ hàng khi component mount
  useEffect(() => {
    updateCartCount();
  }, []);

  // Hàm cập nhật số lượng giỏ hàng từ server
  const updateCartCount = async () => {
    try {
      const count = await getCartQuantity();
      setCartCount(count);
    } catch (error) {
      console.error("Failed to update cart count:", error);
      setCartCount(0);
    }
  };

  // Tăng số lượng giỏ hàng (khi thêm sản phẩm)
  const incrementCartCount = (quantity: number = 1) => {
    setCartCount(prev => prev + quantity);
  };

  // Giảm số lượng giỏ hàng (khi xóa sản phẩm)
  const decrementCartCount = (quantity: number = 1) => {
    setCartCount(prev => Math.max(0, prev - quantity));
  };

  // Reset về 0 (khi clear giỏ hàng hoặc đăng xuất)
  const resetCartCount = () => {
    setCartCount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        updateCartCount,
        incrementCartCount,
        decrementCartCount,
        resetCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
