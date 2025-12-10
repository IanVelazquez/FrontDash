package com.example.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "`order`")   // table name uses backticks for MySQL
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // contact info

    @Column(name = "contact_firstname")
    private String contactFirstname;

    @Column(name = "contact_lastname")
    private String contactLastname;

    @Column(name = "contact_phone")
    private String contactPhone;

    // delivery address

    @Column(name = "delivery_bldg")
    private String deliveryBldg;

    @Column(name = "delivery_street")
    private String deliveryStreet;

    @Column(name = "delivery_city")
    private String deliveryCity;

    @Column(name = "delivery_state")
    private String deliveryState;

    @Column(name = "delivery_zip")
    private String deliveryZip;

    // billing info

    @Column(name = "billing_firstname")
    private String billingFirstname;

    @Column(name = "billing_lastname")
    private String billingLastname;

    @Column(name = "billing_bldg")
    private String billingBldg;

    @Column(name = "billing_street")
    private String billingStreet;

    @Column(name = "billing_city")
    private String billingCity;

    @Column(name = "billing_state")
    private String billingState;

    @Column(name = "billing_zip")
    private String billingZip;

    // card meta info

    @Column(name = "card_type")
    private String cardType;

    @Column(name = "card_expiry")
    private String cardExpiry;

    @Column(name = "card_number")
    private String cardNumber;

    @Column(name = "card_cvv")
    private String cardCvv;

    // times

    @Column(name = "order_date")
    private LocalDate orderDate;

    @Column(name = "order_time")
    private String orderTime;

    @Column(name = "estimated_delivery_time")
    private String estimatedDeliveryTime;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "order_datetime", nullable = false)
    private LocalDateTime orderDatetime;

    // money and status

    @Column(name = "subtotal", nullable = false)
    private BigDecimal subtotal;

    @Column(name = "tip", nullable = false)
    private BigDecimal tip;

    @Column(name = "total", nullable = false)
    private BigDecimal total;

    @Column(name = "driver_id")
    private Integer driverId;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "delivery_time")
    private String deliveryTime;

    public Order() {}

    // getters and setters

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getContactFirstname() { return contactFirstname; }
    public void setContactFirstname(String contactFirstname) { this.contactFirstname = contactFirstname; }

    public String getContactLastname() { return contactLastname; }
    public void setContactLastname(String contactLastname) { this.contactLastname = contactLastname; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getDeliveryBldg() { return deliveryBldg; }
    public void setDeliveryBldg(String deliveryBldg) { this.deliveryBldg = deliveryBldg; }

    public String getDeliveryStreet() { return deliveryStreet; }
    public void setDeliveryStreet(String deliveryStreet) { this.deliveryStreet = deliveryStreet; }

    public String getDeliveryCity() { return deliveryCity; }
    public void setDeliveryCity(String deliveryCity) { this.deliveryCity = deliveryCity; }

    public String getDeliveryState() { return deliveryState; }
    public void setDeliveryState(String deliveryState) { this.deliveryState = deliveryState; }

    public String getDeliveryZip() { return deliveryZip; }
    public void setDeliveryZip(String deliveryZip) { this.deliveryZip = deliveryZip; }

    public String getBillingFirstname() { return billingFirstname; }
    public void setBillingFirstname(String billingFirstname) { this.billingFirstname = billingFirstname; }

    public String getBillingLastname() { return billingLastname; }
    public void setBillingLastname(String billingLastname) { this.billingLastname = billingLastname; }

    public String getBillingBldg() { return billingBldg; }
    public void setBillingBldg(String billingBldg) { this.billingBldg = billingBldg; }

    public String getBillingStreet() { return billingStreet; }
    public void setBillingStreet(String billingStreet) { this.billingStreet = billingStreet; }

    public String getBillingCity() { return billingCity; }
    public void setBillingCity(String billingCity) { this.billingCity = billingCity; }

    public String getBillingState() { return billingState; }
    public void setBillingState(String billingState) { this.billingState = billingState; }

    public String getBillingZip() { return billingZip; }
    public void setBillingZip(String billingZip) { this.billingZip = billingZip; }

    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }

    public String getCardExpiry() { return cardExpiry; }
    public void setCardExpiry(String cardExpiry) { this.cardExpiry = cardExpiry; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getCardCvv() { return cardCvv; }
    public void setCardCvv(String cardCvv) { this.cardCvv = cardCvv; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public String getOrderTime() { return orderTime; }
    public void setOrderTime(String orderTime) { this.orderTime = orderTime; }

    public String getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(String estimatedDeliveryTime) { this.estimatedDeliveryTime = estimatedDeliveryTime; }

    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }

    public LocalDateTime getOrderDatetime() { return orderDatetime; }
    public void setOrderDatetime(LocalDateTime orderDatetime) { this.orderDatetime = orderDatetime; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTip() { return tip; }
    public void setTip(BigDecimal tip) { this.tip = tip; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public Integer getDriverId() { return driverId; }
    public void setDriverId(Integer driverId) { this.driverId = driverId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(String deliveryTime) { this.deliveryTime = deliveryTime; }
}
