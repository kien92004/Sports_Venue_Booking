package duan.sportify.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import duan.sportify.dao.OrderDAO;
import duan.sportify.dao.OrderDetailDAO;
import duan.sportify.entities.Orderdetails;
import duan.sportify.entities.Orders;
import duan.sportify.service.OrderService;

@SuppressWarnings("unused")
@Service
public class OrderServiceImpl implements OrderService {
	@Autowired
	OrderDAO orderDAO;
	@Autowired
	OrderDetailDAO orderDetailDAO;

	@Override
	public List<Orders> findAll() {
		// TODO Auto-generated method stub
		return orderDAO.findAll();
	}

	@Override
	public Orders create(Orders orderData) {
		// Lưu Order trước
		Orders savedOrder = orderDAO.save(orderData);

		// Nếu orderData có danh sách chi tiết thì lưu tiếp
		if (orderData.getOrderDetails() != null && !orderData.getOrderDetails().isEmpty()) {
			for (Orderdetails d : orderData.getOrderDetails()) {
				d.setOrders(savedOrder); // gán FK
			}
			orderDetailDAO.saveAll(orderData.getOrderDetails());
		}

		return savedOrder;
	}

	@Override
	public Orders findById(Integer id) {
		// TODO Auto-generated method stub
		return orderDAO.findById(id).get();
	}

	@Override
	public Orders update(Orders orders) {
		// TODO Auto-generated method stub
		return orderDAO.save(orders);
	}

	@Override
	public void delete(Integer id) {
		// TODO Auto-generated method stub
		orderDAO.deleteById(id);
	}

	@Override
	public List<Orders> findByUsername(String username) {
		return orderDAO.findByUsername(username);
	}

	@Override
	public int countUserBookingsToday(String username) {
		return orderDetailDAO.countUserBookingsToday(username);
	}

}
