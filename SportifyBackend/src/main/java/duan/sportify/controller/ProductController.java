package duan.sportify.controller;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.dao.CategoryDAO;
import duan.sportify.dao.ProductDAO;
import duan.sportify.entities.Categories;
import duan.sportify.entities.Products;
import duan.sportify.service.CategoryService;
import duan.sportify.service.ProductService;

@RestController
@RequestMapping("api/sportify")
public class ProductController {
    @Autowired
    ProductDAO productDAO;
    @Autowired
    ProductService productService;
    // phần category
    @Autowired
    CategoryDAO categoryDAO;
    @Autowired
    CategoryService categoryService;

    @GetMapping("product")
    public ResponseEntity<?> list(@RequestParam("categoryid") Optional<Integer> categoryid) {
        List<Products> productList;
        if (categoryid.isPresent()) {
            productList = productService.findByCategoryId(categoryid.get());
        } else {
            productList = productDAO.findAll();
        }
        // category list
        List<Categories> categoryList = categoryDAO.findAll();

        Map<String, Object> body = new HashMap<>();
        body.put("productList", productList);
        body.put("categoryList", categoryList);

        return ResponseEntity.ok(body);
    }

    @GetMapping("product-single/{productid}")
    public ResponseEntity<Products> detail(@PathVariable("productid") Integer productid) {
        Products product = productService.findById(productid);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }
   
    
    @PostMapping("/product/search")
    public ResponseEntity<?> search(@RequestParam("searchText") String searchText) {
        if (searchText == null || searchText.trim().isEmpty()) {
            // trả về tất cả sản phẩm nếu search rỗng (tương đương redirect trước đó)
            List<Products> all = productDAO.findAll();
            return ResponseEntity.ok(Collections.singletonMap("productList", all));
        }
        List<Products> findProduct = productDAO.findByName(searchText);

        Map<String, Object> body = new HashMap<>();
        body.put("productList", findProduct);
        if (findProduct.size() > 0) {
            body.put("foundMessage", "Tìm thấy " + findProduct.size() + " kết quả tìm kiếm của '" + searchText + "'.");
        } else {
            body.put("notFoundMessage", "Không có sản phẩm nào với từ khóa tìm kiếm là '" + searchText + "'.");
        }
        return ResponseEntity.ok(body);
    }

}
