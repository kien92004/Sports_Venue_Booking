import { createContext, useState, useContext, useEffect } from "react";
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    updateCartCount();
  }, []);

  const updateCartCount = async () => {
    try {
      const count = await getCartQuantity();
      setCartCount(count);
    } catch (error) {
      console.error("Failed to update cart count:", error);
      setCartCount(0);
    }
  };

  const incrementCartCount = (quantity: number = 1) => {
    setCartCount(prev => prev + quantity);
  };

  const decrementCartCount = (quantity: number = 1) => {
    setCartCount(prev => Math.max(0, prev - quantity));
  };

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
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
