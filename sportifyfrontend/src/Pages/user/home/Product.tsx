import React, { useEffect, useState } from 'react';
import HeroSection from "../../../components/user/Hero"; // Thêm import
import getImageUrl from '../../../helper/getImageUrl';
import { fetchProductList } from '../../../service/user/home/productApi';

interface Category {
  categoryid: number;
  categoryname: string;
}

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
  categories?: Category;
}

const Product: React.FC = () => {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProductList();
        setCategoryList(data.categoryList || []);
        setProductList(data.productList || []);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // client-side filtering is applied automatically by filteredProducts
  };

  const filteredProducts = productList.filter((p) =>
    p.productname.toLowerCase().includes(searchText.toLowerCase()) &&
    (selectedCategory ? p.categoryid === selectedCategory : true)
  );

  const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <HeroSection
        backgroundImage="/user/images/bg_product.png"
        title="Sản Phẩm"
        breadcrumbs={[
          { label: "Trang Chủ", href: "/sportify" },
          { label: "Sản Phẩm" }
        ]}
      />
      {/* container sản phẩm */}
      <section className="ftco-section">
        <div className="container">
          <div className="row">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="mb-0 d-flex justify-content-center col-md-12">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                name="searchText"
                className="form-control me-2 col-6"
                type="search"
                placeholder="Tìm kiếm theo tên"
                aria-label="Search"
              />
              <button className="btn btn-outline-success col-2" type="submit">Search</button>
            </form>

            {/* Search results message */}
            <div className="col-12 mt-1">
              {filteredProducts.length === 0 && searchText && (
                <div className="text-center">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchText}"</div>
              )}
            </div>

            {/* Category filter */}
            <div className="col-12 mt-4">
              <div
                className="d-flex flex-wrap justify-content-center align-items-center border rounded py-3 px-4 bg-light"
                style={{ gap: '0.75rem' }}
              >
                <span className="fw-semibold text-success">Loại sản phẩm:</span>
                <button
                  type="button"
                  className={`btn ${selectedCategory === null ? 'btn-success text-white' : 'btn-outline-success'}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  Tất cả
                </button>
                {categoryList.map((category) => (
                  <button
                    key={category.categoryid}
                    type="button"
                    className={`btn ${selectedCategory === category.categoryid ? 'btn-success text-white' : 'btn-outline-success'}`}
                    onClick={() => setSelectedCategory(category.categoryid)}
                  >
                    {category.categoryname}
                  </button>
                ))}
              </div>
            </div>

            {/* Product grid */}
            <div className="col-12 mt-4">
              <div className="row">
                {filteredProducts.map((product) => (
                  <div key={product.productid} className="d-flex col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4">
                    <div className="product w-100" style={{ backgroundColor: '#EEEEEE' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <img
                          className="img d-flex align-items-center justify-content-center"
                          src={getImageUrl(product.image)}
                          alt="Error"
                          style={{ height: '250px', width: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="text text-center">
                        <div className="row hoverIcons col-12">
                          <div className="col-12 mb-2">
                            <a
                              href={`/sportify/product-single/${product.productid}`}
                              className="btn btn-success btn-sm"
                            >
                              Xem chi tiết
                            </a>
                          </div>
                        </div>
                        <h2>{product.productname}</h2>
                        <div className="mb-0">
                          <p>
                            Giá gốc:
                            <del>{formatPrice(product.price)}</del>
                          </p>
                          <p>
                            Giá bán: <span className="price">{formatPrice(product.price - product.discountprice)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Product;