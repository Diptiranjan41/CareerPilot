package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.PerformanceTracking;
import com.careerpilot.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceTrackingRepository extends JpaRepository<PerformanceTracking, Long> {
    List<PerformanceTracking> findByUser(User user);
    List<PerformanceTracking> findByUser_Id(Long userId);
    Optional<PerformanceTracking> findByUser_IdAndCategory(Long userId, String category);
    default List<PerformanceTracking> findByStudentId(Long userId) { return findByUser_Id(userId); }
    default Optional<PerformanceTracking> findByStudentIdAndTopicId(Long userId, Long topicId) { return Optional.empty(); }
}