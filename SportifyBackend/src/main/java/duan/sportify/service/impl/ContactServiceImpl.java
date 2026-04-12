package duan.sportify.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import duan.sportify.dao.ContactDAO;
import duan.sportify.service.ContactService;

@Service
public class ContactServiceImpl implements ContactService{
	@Autowired
	ContactDAO contactDAO;

	@Override
	public void deleteById(String id) {
		contactDAO.deleteById(id);
		contactDAO.flush(); // lưu thay đổi vào db sau khi xóa
	}
}
