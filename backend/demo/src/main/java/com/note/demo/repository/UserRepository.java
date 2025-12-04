package com.note.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.note.demo.model.Users;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByKeycloakId(String keycloakId);
    Optional<Users> findByUsername(String username);
    Optional<Users> findByEmail(String email);
}
