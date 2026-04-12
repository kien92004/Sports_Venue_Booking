package duan.sportify.service;

import java.util.List;

import duan.sportify.entities.Orders;

public interface OrderService {
    List<Orders> findAll();

    Orders create(Orders orderData);

    Orders update(Orders orders);

    void delete(Integer id);

    Orders findById(Integer id);

    List<Orders> findByUsername(String username);

    int countUserBookingsToday(String username);
}
