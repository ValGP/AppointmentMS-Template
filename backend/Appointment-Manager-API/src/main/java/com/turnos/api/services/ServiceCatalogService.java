package com.turnos.api.services;

import com.turnos.api.common.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;

    public ServiceCatalogService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Transactional
    public ServiceResponse create(ServiceRequest request) {
        Service service = new Service(
                request.name(),
                request.description(),
                request.durationMinutes(),
                request.price()
        );

        return ServiceResponse.from(serviceRepository.save(service));
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> findAll() {
        return serviceRepository.findAll().stream()
                .map(ServiceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse findById(Long id) {
        return ServiceResponse.from(getService(id));
    }

    @Transactional
    public ServiceResponse update(Long id, ServiceRequest request) {
        Service service = getService(id);
        service.updateDetails(
                request.name(),
                request.description(),
                request.durationMinutes(),
                request.price()
        );
        return ServiceResponse.from(service);
    }

    @Transactional
    public ServiceResponse activate(Long id) {
        Service service = getService(id);
        service.activate();
        return ServiceResponse.from(service);
    }

    @Transactional
    public ServiceResponse deactivate(Long id) {
        Service service = getService(id);
        service.deactivate();
        return ServiceResponse.from(service);
    }

    private Service getService(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));
    }
}
