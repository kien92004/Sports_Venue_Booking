package duan.sportify.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import duan.sportify.dao.FieldOwnerRegistrationDAO;
import duan.sportify.entities.FieldOwnerRegistration;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FieldOwnerRegistrationService {

    private final FieldOwnerRegistrationDAO registrationDAO;

    public FieldOwnerRegistration save(FieldOwnerRegistration registration) {
        return registrationDAO.save(registration);
    }

    public boolean existsByUsername(String username) {
        return registrationDAO.existsByUsername(username);
    }

    public List<FieldOwnerRegistration> findByStatus(String status) {
        return registrationDAO.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<FieldOwnerRegistration> findAll() {
        return registrationDAO.findAll();
    }

    public Optional<FieldOwnerRegistration> findById(Long id) {
        return registrationDAO.findById(id);
    }

    public void deleteById(Long id) {
        registrationDAO.deleteById(id);
    }
}