const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

export async function getCartQuantity(): Promise<number> {
  try {
    const res = await fetch(`${URL_BACKEND}/api/user/cart/view`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      return 0;
    }
    const data = await res.json();
    if (data.success && data.cart && Array.isArray(data.cart.items)) {
      return data.cart.items.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0
      );
    }
    return 0;
  } catch {
    return 0;
  }
}
