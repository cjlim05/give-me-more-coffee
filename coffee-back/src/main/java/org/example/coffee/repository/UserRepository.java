package org.example.coffee.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
