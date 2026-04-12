package duan.sportify.rest.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import duan.sportify.GlobalExceptionHandler;
import duan.sportify.dao.ProductDAO;
import duan.sportify.entities.Products;
import duan.sportify.service.UploadService;
import duan.sportify.utils.ErrorResponse;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/rest/products/")
public class Admin_ProductRestController {
	@Autowired
	MessageSource messagesource;
	@Autowired
	ProductDAO productDAO;
	@Autowired
	UploadService uploadService;

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
		return GlobalExceptionHandler.handleValidationException(ex);
	}

	@GetMapping("getAll")
	public ResponseEntity<List<Products>> getAll(Model model) {
		return ResponseEntity.ok(productDAO.findAll());
	}

	@GetMapping("get/{id}")
	public ResponseEntity<Products> getOne(@PathVariable("id") Integer id) {
		if (!productDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(productDAO.findById(id).get());
	}

	@PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> create(
			@ModelAttribute("product") @Valid Products product,
			@RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
		if (product.getProductid() != null && productDAO.existsById(product.getProductid())) {
			return ResponseEntity.badRequest().body("Product đã tồn tại");
		}
		if (imageFile != null && !imageFile.isEmpty()) {
			try {
				String imageUrl = uploadService.uploadImage(imageFile, "product_images");
				System.out.println("imageUrl" + imageUrl);
				product.setImage(imageUrl);
				productDAO.save(product);
			} catch (Exception e) {
				return ResponseEntity.status(500).body("Upload image thất bại: " + e.getMessage());
			}
		}
		return ResponseEntity.ok(product);
	}

	@PutMapping("update/{id}")
	public ResponseEntity<Products> update(@PathVariable("id") Integer id, @Valid @RequestBody Products product) {
		if (!productDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		productDAO.save(product);
		return ResponseEntity.ok(product);
	}

	@DeleteMapping("delete/{id}")
	public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
		if (!productDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		productDAO.deleteById(id);
		return ResponseEntity.ok(Map.of("success", true, "message", "Deleted successfully"));
	}

	@GetMapping("search")
	public ResponseEntity<List<Products>> search(
			@RequestParam("productname") Optional<String> productname,
			@RequestParam("categoryid") Optional<Integer> categoryid,
			@RequestParam("productstatus") Optional<Integer> productstatus) {
		return ResponseEntity.ok(productDAO.searchProductAdmin(productname, categoryid, productstatus));
	}
}
