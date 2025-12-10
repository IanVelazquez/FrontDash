package com.example.demo.controller;

import com.example.demo.entity.MenuItem;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderItem;
import com.example.demo.entity.Driver;

import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.OrderItemRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.DriverRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(
        origins = "http://127.0.0.1:3000",
        allowCredentials = "true"
)
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final DriverRepository driverRepository;

    public OrderController(OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository,
                           MenuItemRepository menuItemRepository,
                           DriverRepository driverRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.driverRepository = driverRepository;
    }


    // grt spi, orders, status

    @GetMapping
    public List<Order> getOrders(@RequestParam(required = false) String status) {
        if (status == null || status.isBlank()) {
            return orderRepository.findAll();
        }
        return orderRepository.findByStatusOrderByOrderDatetimeAsc(status.toLowerCase());
    }


    // get single order

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable Integer orderId) {
        return orderRepository.findById(orderId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Order not found."));
    }


    // dto for returning order items with names + prices
    public static class OrderItemView {
        public Integer id;
        public String itemName;
        public BigDecimal price;
        public int quantity;
        public BigDecimal lineTotal;

        public OrderItemView(Integer id, String itemName, BigDecimal price, int quantity) {
            this.id = id;
            this.itemName = itemName;
            this.price = price;
            this.quantity = quantity;
            this.lineTotal = price.multiply(BigDecimal.valueOf(quantity));
        }
    }


    // create Order dtos
    public static class CreateOrderItemRequest {
        public Integer menuItemId;
        public int quantity;
    }

    public static class CreateOrderRequest {

        public BigDecimal subtotal;
        public BigDecimal tip;
        public BigDecimal total;

        public String status;

        public String contactFirstname;
        public String contactLastname;
        public String contactPhone;

        public String deliveryBldg;
        public String deliveryStreet;
        public String deliveryCity;
        public String deliveryState;
        public String deliveryZip;

        public List<CreateOrderItemRequest> items;
    }


    // return all items for a given order
    @GetMapping("/{orderId}/items")
    public List<OrderItemView> getOrderItems(@PathVariable Integer orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        List<OrderItemView> result = new ArrayList<>();

        for (OrderItem oi : items) {
            menuItemRepository.findById(oi.getMenuItemId()).ifPresent(menuItem -> {
                result.add(new OrderItemView(
                        oi.getId(),
                        menuItem.getName(),
                        menuItem.getPrice(),
                        oi.getQuantity()
                ));
            });
        }

        return result;
    }


    // new order

    @PostMapping
    public Order createOrder(@RequestBody CreateOrderRequest req) {

        Order order = new Order();

        order.setSubtotal(req.subtotal);
        order.setTip(req.tip);
        order.setTotal(req.total);

        order.setStatus(
                (req.status == null || req.status.isBlank())
                        ? "new"
                        : req.status.toLowerCase()
        );

        order.setContactFirstname(req.contactFirstname);
        order.setContactLastname(req.contactLastname);
        order.setContactPhone(req.contactPhone);

        order.setDeliveryBldg(req.deliveryBldg);
        order.setDeliveryStreet(req.deliveryStreet);
        order.setDeliveryCity(req.deliveryCity);
        order.setDeliveryState(req.deliveryState);
        order.setDeliveryZip(req.deliveryZip);

        order.setOrderDatetime(LocalDateTime.now());

        order = orderRepository.save(order);

        if (req.items != null) {
            for (CreateOrderItemRequest itemReq : req.items) {
                OrderItem item = new OrderItem();
                item.setOrderId(order.getId());
                item.setMenuItemId(itemReq.menuItemId);
                item.setQuantity(itemReq.quantity);
                orderItemRepository.save(item);
            }
        }

        return order;
    }


    // assign a driver
    public static class AssignDriverRequest {
        public Integer driverId;
        public Integer staffId;
    }

    @PostMapping("/{orderId}/assign")
    public ResponseEntity<?> assignDriver(
            @PathVariable Integer orderId,
            @RequestBody AssignDriverRequest req) {

        if (req == null || req.driverId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("driverId is required.");
        }

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order not found.");
        }

        Optional<Driver> driverOpt = driverRepository.findById(req.driverId);
        if (driverOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Driver not found.");
        }

        Order order = orderOpt.get();
        Driver driver = driverOpt.get();

        String status = (driver.getStatus() == null)
                ? ""
                : driver.getStatus().trim().toLowerCase();

        if (!"active".equals(status)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Driver is inactive and cannot be assigned.");
        }

        order.setDriverId(driver.getId());

        String currentStatus = order.getStatus() == null
                ? "new"
                : order.getStatus().toLowerCase();

        if (!"canceled".equals(currentStatus) && !"delivered".equals(currentStatus)) {
            order.setStatus("assigned");
        }

        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    //status update

    public static class StatusUpdateRequest {
        public String status;
        public Integer staffId;
    }

    @PostMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer orderId,
            @RequestBody StatusUpdateRequest req) {

        if (req == null || req.status == null || req.status.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("status is required.");
        }

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order not found.");
        }

        Order order = orderOpt.get();
        order.setStatus(req.status.trim().toLowerCase());
        orderRepository.save(order);

        return ResponseEntity.ok(order);
    }

    //order delivered
    @PostMapping("/{orderId}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Integer orderId) {

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order not found.");
        }

        Order order = orderOpt.get();

        order.setStatus("delivered");

        LocalDateTime now = LocalDateTime.now();
        order.setDeliveryDate(now.toLocalDate());
        order.setDeliveryTime(now.toLocalTime().toString());

        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }


    // pemding oreders staff dashboard
    // ======================================================
    @GetMapping("/pending")
    public List<Order> getPendingOrders() {
        return orderRepository.findByStatusOrderByOrderDatetimeAsc("new");
    }


    // completed orders on staff dashboard
    // ======================================================
    @GetMapping("/completed")
    public List<Order> getCompletedOrders() {
        return orderRepository.findByStatusOrderByOrderDatetimeAsc("delivered");
    }
}
