package com.turnos.api.services;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ServiceTest {

    @Test
    void canBeBookedRequiresActiveServiceWithValidDuration() {
        Service service = new Service("Haircut", "Basic haircut", 30, BigDecimal.valueOf(1000));

        assertThat(service.hasValidDuration()).isTrue();
        assertThat(service.canBeBooked()).isTrue();

        service.deactivate();

        assertThat(service.canBeBooked()).isFalse();
    }

    @Test
    void calculatesEndDateTimeUsingDuration() {
        Service service = new Service("Session", null, 45, null);
        LocalDateTime start = LocalDateTime.of(2027, 5, 24, 10, 0);

        assertThat(service.calculateEndDateTime(start)).isEqualTo(LocalDateTime.of(2027, 5, 24, 10, 45));
    }
}
