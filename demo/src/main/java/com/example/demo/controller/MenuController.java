package com.example.demo.controller;

import com.example.demo.entity.MenuItem;
import com.example.demo.repository.MenuItemRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(
        origins = "http://127.0.0.1:3000",
        allowCredentials = "true"
)
public class MenuController {

    private final MenuItemRepository menuItemRepository;

    public MenuController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    // get http://127.0.0.1:8080/api/menu-items
    @GetMapping("/menu-items")
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }
}
