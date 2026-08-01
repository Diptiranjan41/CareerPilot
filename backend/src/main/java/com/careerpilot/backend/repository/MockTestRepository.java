package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.MockTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MockTestRepository extends JpaRepository<MockTest, Long> {
    List<MockTest> findByUser_IdOrderByCompletedAtDesc(Long userId);
    List<MockTest> findByUser_IdAndCategory(Long userId, String category);
    MockTest findTopByUser_IdOrderByCompletedAtDesc(Long userId);
    List<MockTest> findByCategoryAndDifficultyOrderByPercentageDesc(String category, String difficulty);
    List<MockTest> findByCategoryOrderByPercentageDesc(String category);
    List<MockTest> findAllByOrderByPercentageDesc();
    List<MockTest> findAllByOrderByCompletedAtDesc();

    default List<MockTest> findByUserIdOrderByCompletedAtDesc(Long userId) { return findByUser_IdOrderByCompletedAtDesc(userId); }
    default List<MockTest> findByUserIdAndCategory(Long userId, String category) { return findByUser_IdAndCategory(userId, category); }
    default MockTest findTopByUserIdOrderByCompletedAtDesc(Long userId) { return findTopByUser_IdOrderByCompletedAtDesc(userId); }
}