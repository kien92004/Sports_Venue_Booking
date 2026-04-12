import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentComponent from '../../../components/user/CommentComponent';
import HeroSection from "../../../components/user/Hero";
import { useNotification } from '../../../helper/NotificationContext';
import { useCart } from '../../../helper/useCartCount';
import { addProductToCart, fetchProductDetail } from '../../../service/user/home/productApi';

interface Product {
  productid: number;
  categoryid: number;
  productname: string;
  image: string;
  discountprice: number;
  datecreate: string;
  price: number;
  productstatus: boolean;
  descriptions: string;
  quantity: number;
  categories: {
    categoryid: number;
    categoryname: string;
  };
}

const ProductDetail: React.FC = () => {
  const productid = useParams().productid as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const { addNotification } = useNotification();
  const { incrementCartCount } = useCart();

  useEffect(() => {
    fetchProductDetail(productid)
      .then(data => setProduct(data));
  }, []);

  const handleAddProductToCart = () => {
    addProductToCart(productid, addQuantity)
      .then((data) => {
        if (data?.ok) {
          alert("Thêm sản phẩm vào giỏ hàng thành công!");
          addNotification("Thêm sản phẩm vào giỏ hàng thành công!", "success");
          // Cập nhật số lượng giỏ hàng ngay lập tức
          incrementCartCount(addQuantity);
        } else {
          addNotification("Thêm sản phẩm thất bại!", "error");
        }
      })
      .catch((err) => {
        console.error("Add to cart failed:", err);
        addNotification("Có lỗi xảy ra khi thêm vào giỏ hàng!", "error");
      });
    if (product) {
      setCartItems([...cartItems, { ...product, quantity: addQuantity }]);
      setTotalPrice(totalPrice + addQuantity * (product.price - product.discountprice));
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div style={{ backgroundImage: `url('/user/images/bgAll.png')`, backgroundRepeat: 'repeat', backgroundSize: '100% 100%' }}>
      <HeroSection
        backgroundImage="/user/images/bg_product.png"
        title="Chi tiết SP"
        breadcrumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Products", href: "/product" },
          { label: "Products Single" }
        ]}
      />
      {/* Product Detail Section */}
      <section className="ftco-section">
        <div className="container">
          <div className="row" style={{ background: 'white' }}>
            <div className="col-lg-6 mb-5">
              <a href="#" className="image-popup prod-img-bg">
                <img
                  src={`/user/images/products_img/${product.image}`}
                  className="img-fluid"
                  alt={product.productname}
                />
              </a>
            </div>
            <div className="col-lg-6 product-details pl-md-5">
              <h1>{product.productname}</h1>
              <div className="price">
                <h3>
                  Giá gốc:
                  <del>
                    <span>{product.price.toLocaleString()} đ</span>
                  </del>
                </h3>
                <h3>
                  Giá bán: <span>{(product.price - product.discountprice).toLocaleString()} đ</span>
                </h3>
              </div>

              <div className="row mt-4">
                <div className="w-100"></div>
                <div className="col-md-12">
                  <p style={{ color: '#000' }}>
                    {product.productstatus ? 'Còn hàng' : 'Hết hàng'}
                  </p>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="row mt-3">
                <div className="col-md-12">
                  <label htmlFor="addQuantity" style={{ color: '#000', fontWeight: 'bold', marginRight: '10px' }}>
                    Số lượng:
                  </label>
                  <input
                    id="addQuantity"
                    type="number"
                    min={1}
                    max={product.quantity}
                    value={addQuantity}
                    onChange={e => setAddQuantity(Math.max(1, Math.min(product.quantity, Number(e.target.value))))}
                    style={{ width: '80px', padding: '5px', marginLeft: '10px' }}
                    className="form-control d-inline-block"
                  />
                </div>
              </div>

              <p className="mt-4">
                <button
                  onClick={handleAddProductToCart}
                  disabled={!product.productstatus}
                  className="btn btn-product py-3 px-5 mr-2"
                  style={{ color: 'black', border: '1px solid black', opacity: product.productstatus ? 1 : 0.5 }}
                >
                  {product.productstatus ? 'Thêm vào giỏ' : 'Hết hàng'}
                </button>
              </p>
              <p className="mt-4">
                <a
                  href='/sportify/cart/view'
                  className="btn btn-success "
                >
                  Mua ngay
                </a>
              </p>
            </div>
          </div>

          {/* Product Description */}
          <div className="row mt-5">
            <div className="col-md-12 nav-link-wrap">
              <div className="nav nav-pills d-flex text-center" id="v-pills-tab"
                role="tablist" aria-orientation="vertical">
                <a className="nav-link active mr-lg-1" id="v-pills-1-tab"
                  data-toggle="pill" href="#v-pills-1" role="tab"
                  aria-controls="v-pills-1" aria-selected="true">Mô tả</a>
              </div>
            </div>
            <div className="col-md-12 tab-wrap">
              <div className="tab-content bg-light" id="v-pills-tabContent">
                <div className="tab-pane fade show active" id="v-pills-1"
                  role="tabpanel" aria-labelledby="day-1-tab">
                  <div className="p-4">
                    <div style={{
                      whiteSpace: 'pre-line',
                      wordWrap: 'break-word',
                      fontFamily: '14/18px Arial, sans-serif',
                      textAlign: 'justify',
                      fontSize: '16px',
                      lineHeight: '1.5'
                    }}>
                      {product.descriptions}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Comment Section - Uncomment if Comment component is available */}
          <div className="row mt-5">
            <div className="col-md-12">
              <CommentComponent productId={product.productid} type="product" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;