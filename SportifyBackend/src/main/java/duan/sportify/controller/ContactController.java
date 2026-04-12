package duan.sportify.controller;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import duan.sportify.dao.ContactDAO;
import duan.sportify.entities.Contacts;
import duan.sportify.service.UserService;

@Controller
public class ContactController {
	@Autowired
	ContactDAO contactDAO;
	@Autowired
	UserService userService;
	String userlogin;

	@GetMapping("api/sportify/contact")
	public ResponseEntity<Map<String, Object>> view(Model model, HttpServletRequest request) {
		List<String> listcontacted = contactDAO.contactedInDay();
		return new ResponseEntity<>(Map.of("status", "success", "listcontacted", listcontacted), HttpStatus.OK);
	}

	@ResponseBody
	@PostMapping("api/user/submit-contact")
	public ResponseEntity<Map<String, Object>> processContactForm(HttpServletRequest request,
			@RequestBody Map<String, Object> body) {
				System.out.println(body);
		String sessionUser = (String) request.getSession().getAttribute("username");
		Map<String, Object> contactsBody = (Map<String, Object>) body.get("contacts");
		Contacts contacts = new Contacts();
		// Lưu thông tin
		contacts.setUsername(sessionUser);
		contacts.setTitle((String) contactsBody.get("title"));
		contacts.setMeesagecontact((String) contactsBody.get("meesagecontact"));
		contacts.setCategory((String) contactsBody.get("category"));
		LocalDate localDate = LocalDate.now();
		Date date = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
		contacts.setDatecontact(date);
		contactDAO.save(contacts);
		
		return new ResponseEntity<>(Map.of("status", "success"), HttpStatus.OK);
	}
}
