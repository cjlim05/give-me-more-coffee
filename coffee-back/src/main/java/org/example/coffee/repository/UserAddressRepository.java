package org.example.coffee.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.UserAddress;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUser_UserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    Optional<UserAddress> findByUser_UserIdAndIsDefaultTrue(Long userId);
}
