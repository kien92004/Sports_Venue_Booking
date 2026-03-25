const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
// API functions for Product and ProductDetail
export async function fetchProductList() {
  const res = await fetch(`${URL_BACKEND}/api/sportify/product`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function fetchProductDetail(productid: any) {
  const res = await fetch(`${URL_BACKEND}/api/sportify/product-single/${productid}`);
  if (!res.ok) throw new Error('Failed to fetch product detail');
  return res.json();
}

export async function addProductToCart(productid: any, quantity: any) {
  const res = await fetch(`${URL_BACKEND}/api/user/cart/add/${productid}?quantity=${quantity}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  return res;
}
