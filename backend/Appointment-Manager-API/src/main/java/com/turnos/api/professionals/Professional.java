package com.turnos.api.professionals;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "professionals")
public class Professional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(nullable = false)
    private boolean active;

    protected Professional() {
    }

    public Professional(String fullName, String email, String phone) {
        this.fullName = requireText(fullName, "fullName");
        this.email = requireText(email, "email").toLowerCase();
        this.phone = phone;
        this.active = true;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public void updateProfile(String fullName, String email, String phone) {
        this.fullName = requireText(fullName, "fullName");
        this.email = requireText(email, "email").toLowerCase();
        this.phone = phone;
    }

    public boolean canAttendAppointments() {
        return active;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public boolean isActive() {
        return active;
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return value;
    }
}
