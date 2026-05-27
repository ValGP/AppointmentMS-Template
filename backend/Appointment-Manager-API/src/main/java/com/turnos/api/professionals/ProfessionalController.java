package com.turnos.api.professionals;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/professionals")
public class ProfessionalController {

    private final ProfessionalService professionalService;

    public ProfessionalController(ProfessionalService professionalService) {
        this.professionalService = professionalService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessionalResponse create(@Valid @RequestBody ProfessionalRequest request) {
        return professionalService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ProfessionalResponse> findAll() {
        return professionalService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessionalResponse findById(@PathVariable Long id) {
        return professionalService.findById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessionalResponse update(@PathVariable Long id, @Valid @RequestBody ProfessionalRequest request) {
        return professionalService.update(id, request);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessionalResponse activate(@PathVariable Long id) {
        return professionalService.activate(id);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessionalResponse deactivate(@PathVariable Long id) {
        return professionalService.deactivate(id);
    }
}
