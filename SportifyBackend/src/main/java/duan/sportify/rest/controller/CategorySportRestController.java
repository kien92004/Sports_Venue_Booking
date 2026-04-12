package duan.sportify.rest.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.GlobalExceptionHandler;
import duan.sportify.dao.SportTypeDAO;
import duan.sportify.entities.Sporttype;
import duan.sportify.utils.ErrorResponse;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/rest/sportTypes/")
public class CategorySportRestController {
	@Autowired
	MessageSource messagesource;
	@Autowired
	SportTypeDAO sportTypeDAO;

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
		return GlobalExceptionHandler.handleValidationException(ex);
	}

	@GetMapping("getAll")
	public List<Sporttype> getAll() {
		return sportTypeDAO.findAll();
	}

	@GetMapping("get/{id}")
	public Object getOne(@PathVariable("id") String id) {
		if (!sportTypeDAO.existsById(id)) {
			return Map.of("error", "Not found");
		}
		return sportTypeDAO.findById(id).get();
	}

	@PostMapping("create")
	public Map<String, Object> create(@Valid @RequestBody Sporttype sporttype) {
		if (sporttype.getSporttypeid() != null && sportTypeDAO.existsById(sporttype.getSporttypeid())) {
			return Map.of("error", "Sport type already exists");
		} else if (sporttype.getSporttypeid() == null && !sportTypeDAO.existsById(sporttype.getSporttypeid())) {
			return Map.of("error", "Sport type id is required");
		} else {
			sportTypeDAO.save(sporttype);
			return Map.of("message", "Sport type created successfully", "sporttype", sporttype);
		}
	}

	@PutMapping("update/{id}")
	public Map<String, Object> update(@PathVariable("id") String id, @Valid @RequestBody Sporttype sportType) {
		if (!sportTypeDAO.existsById(id)) {
			return Map.of("error", "Not found");
		}
		sportTypeDAO.save(sportType);
		return Map.of("message", "Sport type updated successfully", "sporttype", sportType);
	}

	@DeleteMapping("delete/{id}")
	public Map<String, Object> delete(@PathVariable("id") String id) {
		if (!sportTypeDAO.existsById(id)) {
			return Map.of("error", "Not found");
		}
		try {
			sportTypeDAO.deleteById(id);
			return Map.of("message", "Xóa loại hình thể thao thành công");
		} catch (org.springframework.dao.DataIntegrityViolationException ex) {
			return Map.of(
					"error", "Không thể xóa loại hình thể thao này vì đang được sử dụng ở bảng sân hoặc thực thể khác.",
					"detail",
					"Vui lòng xóa hoặc cập nhật các sân (field) liên quan trước khi xóa loại hình thể thao này.");
		}
	}

	@GetMapping("search")
	public List<Sporttype> search(@RequestParam("categoryname") Optional<String> categoryname) {
		return sportTypeDAO.searchSport(categoryname);
	}

}
