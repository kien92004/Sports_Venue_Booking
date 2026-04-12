package duan.sportify.service;

import duan.sportify.entities.Cart;

public interface CartService {
    Cart getActiveCart(String username);

    Cart addToCart(String username, Integer productId, int quantity);

    Cart viewCart(String username);

    void removeFromCart(String username, Integer cartItemId);

    void removeAllFromCart(String username);

    void updateCartItemQuantity(String username, Integer cartItemId, int quantity);

}
