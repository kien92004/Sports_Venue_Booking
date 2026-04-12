
package duan.sportify.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.entities.Cart;
import duan.sportify.entities.CartItem;
import duan.sportify.service.CartService;

@RestController
@RequestMapping("api/user/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    @Autowired
    private duan.sportify.service.UserService userService;

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToCart(HttpServletRequest request,
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "1") int quantity) {
        String username = (String) request.getSession().getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "User not logged in"));
        }

        Cart cart = cartService.addToCart(username, productId, quantity);

        // ép ra JSON gọn
        return ResponseEntity.ok(Map.of(
                "success", true, "cart", cart));
    }

    @GetMapping("/view")
    public Map<String, Object> viewCart(HttpSession session) {
        Map<String, Object> resp = new HashMap<>();
        String username = (String) session.getAttribute("username");

        if (username == null) {
            resp.put("success", false);
            resp.put("message", "User not logged in");
        } else {
            Cart cart = cartService.viewCart(username);
            for (CartItem item : cart.getItems()) {
                item.setProductName(item.getProduct().getProductname());
                item.setImage(item.getProduct().getImage());
            }
            resp.put("success", true);
            resp.put("cart", cart);
        }
        return resp;
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeFromCart(HttpServletRequest request,
            @PathVariable Integer cartItemId) {
        String username = (String) request.getSession().getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "User not logged in"));
        }
        cartService.removeFromCart(username, cartItemId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Product removed from cart"));
    }

    @DeleteMapping("/remove-all")
    public ResponseEntity<?> removeAllFromCart(HttpServletRequest request) {
        String username = (String) request.getSession().getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "User not logged in"));
        }
        cartService.removeAllFromCart(username);
        return ResponseEntity.ok(Map.of("success", true, "message", "All products removed from cart"));
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<?> updateCartItemQuantity(HttpServletRequest request,
            @PathVariable Integer cartItemId,
            @RequestParam int quantity) {
        String username = (String) request.getSession().getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "User not logged in"));
        }

        cartService.updateCartItemQuantity(username, cartItemId, quantity);
        return ResponseEntity.ok(Map.of("success", true, "message", "Cart item quantity updated"));
    }

    @GetMapping("/checkout")
    public ResponseEntity<?> checkoutCart(HttpServletRequest request) {
        String username = (String) request.getSession().getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "User not logged in"));
        }
        // Lấy thông tin user
        duan.sportify.entities.Users profile = userService.findById(username);
        // Lấy giỏ hàng
        Cart cart = cartService.viewCart(username);
        for (CartItem item : cart.getItems()) {
            item.setProductName(item.getProduct().getProductname());
            item.setImage(item.getProduct().getImage());
        }
        // Trả về JSON
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", profile,
                "cartid", cart.getCartid(),
                "items", cart.getItems()));
    }

    @GetMapping("/checkout/items")
    public ResponseEntity<?> checkoutCartItems(HttpServletRequest request,
            @RequestParam String ids) {
        String username = (String) request.getSession().getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "User not logged in"));
        }

        // Parse danh sách ID
        String[] idArray = ids.split(",");
        java.util.List<Integer> cartItemIds = new java.util.ArrayList<>();
        for (String id : idArray) {
            try {
                cartItemIds.add(Integer.parseInt(id.trim()));
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Invalid cart item ID format"));
            }
        }

        // Lấy thông tin user
        duan.sportify.entities.Users profile = userService.findById(username);

        // Lấy giỏ hàng và lọc các sản phẩm được chọn
        Cart cart = cartService.viewCart(username);
        java.util.List<CartItem> selectedItems = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            if (cartItemIds.contains(item.getCartItemId())) {
                item.setProductName(item.getProduct().getProductname());
                item.setImage(item.getProduct().getImage());
                selectedItems.add(item);
            }
        }

        if (selectedItems.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "No cart items found"));
        }

        // Trả về JSON
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", profile,
                "cartid", cart.getCartid(),
                "items", selectedItems));
    }

}
