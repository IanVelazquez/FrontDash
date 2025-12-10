package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login")
public class Login {

    @Id
    @Column(name = "username", length = 50)
    private String username;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "login_count")
    private Integer loginCount;

    @Column(name = "must_change_pw")
    private Boolean mustChangePw;

    // map password
    @Column(name = "password_hash", nullable = false, length = 255)
    private String password;

    @Column(name = "role", length = 10)
    private String role;   // admin or staff

    public Login() {}

    //getters and setters

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public Integer getLoginCount() { return loginCount; }
    public void setLoginCount(Integer loginCount) { this.loginCount = loginCount; }

    public Boolean getMustChangePw() { return mustChangePw; }
    public void setMustChangePw(Boolean mustChangePw) { this.mustChangePw = mustChangePw; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
