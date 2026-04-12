package duan.sportify.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import duan.sportify.dao.EventDAO;
import duan.sportify.entities.Eventweb;


@SuppressWarnings("unused")
@RestController
@RequestMapping("api/sportify")
public class EventController {
	@Autowired
	EventDAO eventDAO;

	@GetMapping("/event")
	public ResponseEntity<?> view(
		@RequestParam(value = "eventName", required = false, defaultValue = "") String eventName,
		Pageable pageable,
		@RequestParam(value = "keyword", required = false, defaultValue = "") String keyword
	) {
		Page<Eventweb> eventwebList;
		int keywordLength = keyword == null ? 0 : keyword.length();
		if (eventName == null) {
	        eventName = "";
	    }
		if(keywordLength > 0 && eventName.isEmpty()) {
			eventwebList = eventDAO.searchEvents(keyword, pageable);
			
		}else if(eventName.equalsIgnoreCase("thethao") && keywordLength==0) {
			eventwebList = eventDAO.searchbtnTheThao(pageable);
		}else if(eventName.equalsIgnoreCase("khuyenmai") && keywordLength==0) {
			eventwebList = eventDAO.searchbtnKhuyenMai(pageable);
		}else if(eventName.equalsIgnoreCase("baotri") && keywordLength==0) {
			eventwebList = eventDAO.searchbtnBaoTri(pageable);
		}else{
			
			eventwebList = eventDAO.findAllOrderByDateStart(pageable);
		}
		return ResponseEntity.ok(eventwebList);
	}
	
	// show chi tiết tin tức as JSON
	@GetMapping("/eventdetail/{eventid}")
	public ResponseEntity<?> showEventDetail(@PathVariable("eventid") Integer eventid) {
		Eventweb eventdetail = eventDAO.findEventById(eventid);
		List<Object[]> eventLQ = eventDAO.fillEventInMonth();
		Map<String, Object> resp = new HashMap<>();
		resp.put("eventdetail", eventdetail);
		resp.put("eventLQ", eventLQ);
		return ResponseEntity.ok(resp);
	}

	// search -> return results as JSON
	@PostMapping("/search")
	public ResponseEntity<?> search(@RequestParam("keyword") String keyword, Pageable pageable) {
		if (keyword == null || keyword.trim().isEmpty()) {
			Page<Eventweb> page = eventDAO.findAllOrderByDateStart(pageable);
			return ResponseEntity.ok(page);
		}
		Page<Eventweb> results = eventDAO.searchEvents(keyword, pageable);
		return ResponseEntity.ok(results);
	}
	
	// filter: thethao
	@GetMapping("/event/thethao")
	public ResponseEntity<?> thethao(Pageable pageable) {
		Page<Eventweb> page = eventDAO.searchbtnTheThao(pageable);
		return ResponseEntity.ok(page);
	}
	
	// filter: khuyenmai
	@GetMapping("/event/khuyenmai")
	public ResponseEntity<?> khuyenmai(Pageable pageable) {
		Page<Eventweb> page = eventDAO.searchbtnKhuyenMai(pageable);
		return ResponseEntity.ok(page);
	}
	
	// filter: baotri
	@GetMapping("/event/baotri")
	public ResponseEntity<?> baotri(Pageable pageable) {
		Page<Eventweb> page = eventDAO.searchbtnBaoTri(pageable);
		return ResponseEntity.ok(page);
	}
	
}
