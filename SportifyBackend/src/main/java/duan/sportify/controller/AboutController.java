package duan.sportify.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.dao.EventDAO;
import duan.sportify.dao.FieldDAO;
import duan.sportify.dao.ProductDAO;
import duan.sportify.dao.UserDAO;

@SuppressWarnings("unused")
@RestController
@RequestMapping("api/sportify")
public class AboutController {
	@Autowired
	UserDAO userDAO;
	@Autowired
	FieldDAO fieldDAO;
	@Autowired
	ProductDAO productDAO;
	@Autowired
	EventDAO eventDAO;
	@GetMapping("about")
	public Map<String, Object> view() {
		List<Object> userCount = userDAO.CountUser();
		List<Object> fieldCount = fieldDAO.CountField();
		List<Object> eventCount = eventDAO.CountEvent();
		List<Object> productCount = productDAO.CountProduct();
		
		Map<String, Object> resp = new HashMap<>();
		resp.put("userCount", userCount);
		resp.put("fieldCount", fieldCount);
		resp.put("eventCount", eventCount);
		resp.put("productCount", productCount);
		return resp;
	}
	@GetMapping("chinhsach")
	public Map<String, Object> viewchinhsach() {
		Map<String, Object> resp = new HashMap<>();
		resp.put("page", "chinhsach");
		return resp;
	}
	@GetMapping("quydinh")
	public Map<String, Object> viewdieukien() {
		Map<String, Object> resp = new HashMap<>();
		resp.put("page", "quydinh");
		return resp;
	}
}
