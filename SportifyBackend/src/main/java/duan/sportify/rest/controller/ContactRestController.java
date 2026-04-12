package duan.sportify.rest.controller;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.GlobalExceptionHandler;
import duan.sportify.dao.ContactDAO;
import duan.sportify.entities.Contacts;
import duan.sportify.utils.ErrorResponse;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/rest/contacts/")
public class ContactRestController {
	@Autowired
	MessageSource messagesource;
	@Autowired
	ContactDAO contactDAO;
	@Autowired
	duan.sportify.service.ContactService contactService;

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
		return GlobalExceptionHandler.handleValidationException(ex);
	}

	@GetMapping("getAll")
	public ResponseEntity<List<Contacts>> getAll(Model model) {
		return ResponseEntity.ok(contactDAO.findAll());
	}

	@GetMapping("get/{id}")
	public ResponseEntity<Contacts> getOne(@PathVariable("id") String id) {
		if (!contactDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(contactDAO.findById(id).get());
	}

	@DeleteMapping("delete/{id}")
	public ResponseEntity<?> delete(@PathVariable("id") String id) {
		if (!contactDAO.existsById(id)) {
			return ResponseEntity.status(404).body(java.util.Map.of("message", "Contact not found"));
		}
		contactService.deleteById(id);
		return ResponseEntity.ok(java.util.Map.of("message", "Contact deleted successfully"));
	}

	// search
	@GetMapping("search")
	public ResponseEntity<List<Contacts>> search(
			@RequestParam(name = "datecontact", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datecontact,
			@RequestParam(name = "category", required = false) String category) {

		Date sqlDate = datecontact != null ? Date.valueOf(datecontact) : null;
		String normalizedCategory = (category != null && !category.isBlank()) ? category.trim() : null;

		return ResponseEntity.ok(contactDAO.searchContacts(sqlDate, normalizedCategory));
	}
}
