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
import duan.sportify.dao.EventDAO;
import duan.sportify.entities.Eventweb;
import duan.sportify.service.UploadService;
import duan.sportify.utils.ErrorResponse;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/rest/events/")
public class EventRestController {
	@Autowired
	MessageSource messagesource;
	@Autowired
	EventDAO eventDAO;
	@Autowired
	UploadService uploadService;

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
		return GlobalExceptionHandler.handleValidationException(ex);
	}

	@GetMapping("getAll")
	public ResponseEntity<List<Eventweb>> getAll(Model model) {
		return ResponseEntity.ok(eventDAO.findAll());
	}

	@GetMapping("get/{id}")
	public ResponseEntity<Eventweb> getOne(@PathVariable("id") Integer id) {
		if (!eventDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(eventDAO.findById(id).get());
	}

	@PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> create(
			@ModelAttribute("event") @Valid Eventweb event,
			@RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
		if (event.getEventid() != null && eventDAO.existsById(event.getEventid())) {
			return ResponseEntity.badRequest().body("Event đã tồn tại");
		}
		eventDAO.save(event);
		if (imageFile != null && !imageFile.isEmpty()) {
			try {
				String imageUrl = uploadService.uploadImage(imageFile, "event_images");
				event.setImage(imageUrl);
				eventDAO.save(event);
			} catch (Exception e) {
				return ResponseEntity.status(500).body("Upload image thất bại: " + e.getMessage());
			}
		}
		return ResponseEntity.ok(event);
	}

	@PutMapping("update/{id}")
	public ResponseEntity<Eventweb> update(@PathVariable("id") Integer id, @Valid @RequestBody Eventweb event) {
		if (!eventDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		eventDAO.save(event);
		return ResponseEntity.ok(event);
	}

	@DeleteMapping("delete/{id}")
	public ResponseEntity<Map<String, String>> delete(@PathVariable("id") Integer id) {
		if (!eventDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		eventDAO.deleteById(id);
		return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
	}

	@GetMapping("search")
	public ResponseEntity<List<Eventweb>> search(
			@RequestParam("nameevent") Optional<String> nameevent,
			@RequestParam("eventtype") Optional<String> eventtype) {
		return ResponseEntity.ok(eventDAO.searchEventAdmin(nameevent, eventtype));
	}
}
