package com.turnos.api.professionals;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProfessionalTest {

    @Test
    void canAttendAppointmentsOnlyWhenActive() {
        Professional professional = new Professional("Professional", "PRO@EMAIL.COM", "123");

        assertThat(professional.getEmail()).isEqualTo("pro@email.com");
        assertThat(professional.canAttendAppointments()).isTrue();

        professional.deactivate();

        assertThat(professional.canAttendAppointments()).isFalse();
    }
}
