package org.example.coffee.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.example.coffee.entity.PointHistory;

public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {

    List<PointHistory> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    List<PointHistory> findByUser_UserIdAndType(Long userId, String type);
}
