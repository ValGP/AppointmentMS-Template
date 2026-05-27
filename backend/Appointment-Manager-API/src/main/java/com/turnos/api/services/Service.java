package com.turnos.api.services;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "services")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private int durationMinutes;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private boolean active;

    protected Service() {
    }

    public Service(String name, String description, int durationMinutes, BigDecimal price) {
        this.name = requireText(name, "name");
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.price = price;
        this.active = true;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public void updateDetails(String name, String description, int durationMinutes, BigDecimal price) {
        this.name = requireText(name, "name");
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.price = price;
    }

    public LocalDateTime calculateEndDateTime(LocalDateTime startDateTime) {
        if (startDateTime == null) {
            throw new IllegalArgumentException("startDateTime is required");
        }
        return startDateTime.plusMinutes(durationMinutes);
    }

    public boolean hasValidDuration() {
        return durationMinutes > 0;
    }

    public boolean canBeBooked() {
        return active && hasValidDuration();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public BigDecimal getPrice() {
        return price;
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
