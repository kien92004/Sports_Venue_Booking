package duan.sportify.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import duan.sportify.Repository.CartItemRepository;
import duan.sportify.Repository.CartRepository;
import duan.sportify.dao.ProductDAO;
import duan.sportify.entities.Cart;
import duan.sportify.entities.CartItem;
import duan.sportify.entities.Products;
import duan.sportify.service.CartService;

@Service
public class CartServiceImpl implements CartService {
    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private CartItemRepository cartItemRepo;

    @Autowired
    private ProductDAO productDao;

    @Override
    public Cart getActiveCart(String username) {
        return cartRepo.findByUsernameAndStatus(username, "Active")
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUsername(username);
                    newCart.setStatus("Active");
                    return cartRepo.save(newCart);
                });
    }

    @Override
    public Cart addToCart(String username, Integer productId, int quantity) {
        Cart cart = getActiveCart(username);
        Products product = productDao.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepo.findByCartAndProduct(cart, product)
                .orElseGet(() -> {
                    CartItem item = new CartItem();
                    item.setCart(cart);
                    item.setProduct(product);
                    item.setPrice(product.getPrice());
                    item.setDiscountprice(product.getDiscountprice());
                    item.setQuantity(0);
                    return item;
                });

        cartItem.setQuantity(cartItem.getQuantity() + quantity);
        cartItemRepo.save(cartItem);

        return cartRepo.findById(cart.getCartid()).get();
    }

    @Override
    public Cart viewCart(String username) {
        return getActiveCart(username);
    }

    @Override
    public void removeFromCart(String username, Integer cartItemId) {
        Cart cart = getActiveCart(username);

        // Tìm và xóa cart item theo ID
        cartItemRepo.findById(cartItemId).ifPresent(cartItem -> {
            // Kiểm tra xem cart item có thuộc về giỏ hàng của user không
            if (cartItem.getCart().getCartid().equals(cart.getCartid())) {
                cartItemRepo.delete(cartItem);
            }
        });
    }

    @Override
    @Transactional
    public void removeAllFromCart(String username) {
        Cart cart = getActiveCart(username);
        cartItemRepo.deleteAllByCart(cart);
        cart.getItems().clear();
        cartRepo.save(cart);
    }

    @Override
    @Transactional
    public void updateCartItemQuantity(String username, Integer cartItemId, int quantity) {
        Cart cart = getActiveCart(username);

        cartItemRepo.findById(cartItemId).ifPresent(cartItem -> {
            // Kiểm tra xem cart item có thuộc về giỏ hàng của user không
            if (cartItem.getCart().getCartid().equals(cart.getCartid())) {
                // Giới hạn số lượng từ 1 đến 15
                int newQuantity = Math.max(1, Math.min(15, quantity));
                cartItem.setQuantity(newQuantity);
                cartItemRepo.save(cartItem);
            }
        });
    }

}