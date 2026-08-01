package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.MockTestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MockTestResultRepository extends JpaRepository<MockTestResult, Long> {

    List<MockTestResult> findByUser_IdOrderByCompletedAtDesc(Long userId);
    MockTestResult findTopByUser_IdOrderByCompletedAtDesc(Long userId);
    Optional<MockTestResult> findByIdAndUser_Id(Long id, Long userId);
    MockTestResult findTopByUser_IdOrderByPercentageDesc(Long userId);
    List<MockTestResult> findByUser_IdAndCategoryOrderByCompletedAtDesc(Long userId, String category);
    List<MockTestResult> findByUser_IdAndDifficultyOrderByCompletedAtDesc(Long userId, String difficulty);
    List<MockTestResult> findAllByOrderByPercentageDesc();
    List<MockTestResult> findByCategoryOrderByPercentageDesc(String category);
    List<MockTestResult> findByCategoryAndDifficultyOrderByPercentageDesc(String category, String difficulty);
    List<MockTestResult> findByTopicOrderByPercentageDesc(String topic);
    List<MockTestResult> findByDifficultyOrderByCompletedAtDesc(String difficulty);
    List<MockTestResult> findByPercentageBetween(Double minPercentage, Double maxPercentage);
    List<MockTestResult> findByCategoryAndPercentageGreaterThanEqual(String category, Double percentage);
    List<MockTestResult> findByCompletedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<MockTestResult> findByCategoryAndCompletedAtBetween(String category, LocalDateTime startDate, LocalDateTime endDate);
    void deleteByUser_Id(Long userId);

    @Query(value = "SELECT * FROM mock_test_results ORDER BY percentage DESC LIMIT :limit", nativeQuery = true)
    List<MockTestResult> getTopGlobalResults(@Param("limit") int limit);

    @Query(value = "SELECT * FROM mock_test_results WHERE category = :category ORDER BY percentage DESC LIMIT :limit", nativeQuery = true)
    List<MockTestResult> getTopResultsByCategory(@Param("category") String category, @Param("limit") int limit);

    @Query("SELECT COUNT(r) + 1 FROM MockTestResult r WHERE r.percentage > :percentage")
    Long getUserGlobalRank(@Param("percentage") Double percentage);

    @Query("SELECT COUNT(r) + 1 FROM MockTestResult r WHERE r.category = :category AND r.percentage > :percentage")
    Long getUserRankInCategory(@Param("category") String category, @Param("percentage") Double percentage);

    @Query("SELECT COUNT(r) + 1 FROM MockTestResult r WHERE r.category = :category AND r.difficulty = :difficulty AND r.percentage > :percentage")
    Long getUserRankInCategoryAndDifficulty(@Param("category") String category, @Param("difficulty") String difficulty, @Param("percentage") Double percentage);

    @Query("SELECT COUNT(DISTINCT r.user.id) FROM MockTestResult r")
    Long getTotalUniqueUsers();

    @Query("SELECT COUNT(DISTINCT r.user.id) FROM MockTestResult r WHERE r.category = :category")
    Long getTotalUsersInCategory(@Param("category") String category);

    @Query("SELECT AVG(r.percentage) FROM MockTestResult r WHERE r.category = :category")
    Double getAveragePercentageByCategory(@Param("category") String category);

    @Query("SELECT AVG(r.percentage) FROM MockTestResult r")
    Double getGlobalAveragePercentage();

    @Query("SELECT MAX(r.percentage) FROM MockTestResult r WHERE r.category = :category")
    Double getHighestScoreInCategory(@Param("category") String category);

    @Query("SELECT r FROM MockTestResult r WHERE r.completedAt >= CURRENT_DATE")
    List<MockTestResult> getTodayResults();

    @Query("SELECT r FROM MockTestResult r WHERE r.completedAt >= :weekAgo")
    List<MockTestResult> getLastWeekResults(@Param("weekAgo") LocalDateTime weekAgo);

    @Query("SELECT r FROM MockTestResult r WHERE r.percentage >= 60 ORDER BY r.percentage DESC")
    List<MockTestResult> getPassedResults();

    @Query("SELECT r FROM MockTestResult r WHERE r.percentage < 60 ORDER BY r.percentage DESC")
    List<MockTestResult> getFailedResults();

    @Query("SELECT r.category, COUNT(r) FROM MockTestResult r GROUP BY r.category")
    List<Object[]> countResultsByCategory();

    @Query("SELECT r.difficulty, COUNT(r) FROM MockTestResult r GROUP BY r.difficulty")
    List<Object[]> countResultsByDifficulty();

    @Query("SELECT r.difficulty, AVG(r.percentage) FROM MockTestResult r GROUP BY r.difficulty")
    List<Object[]> getAveragePercentageByDifficulty();

    // Legacy method aliases
    default List<MockTestResult> findByUserIdOrderByCreatedAtDesc(Long userId) { return findByUser_IdOrderByCompletedAtDesc(userId); }
    default MockTestResult findTopByUserIdOrderByCreatedAtDesc(Long userId) { return findTopByUser_IdOrderByCompletedAtDesc(userId); }
    default Optional<MockTestResult> findByIdAndUserId(Long id, Long userId) { return findByIdAndUser_Id(id, userId); }
    default MockTestResult findTopByUserIdOrderByPercentageDesc(Long userId) { return findTopByUser_IdOrderByPercentageDesc(userId); }
    default List<MockTestResult> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category) { return findByUser_IdAndCategoryOrderByCompletedAtDesc(userId, category); }
    default List<MockTestResult> findByUserIdAndDifficultyOrderByCreatedAtDesc(Long userId, String difficulty) { return findByUser_IdAndDifficultyOrderByCompletedAtDesc(userId, difficulty); }
    default void deleteByUserId(Long userId) { deleteByUser_Id(userId); }
    default List<MockTestResult> findByCreatedAtBetween(LocalDateTime s, LocalDateTime e) { return findByCompletedAtBetween(s, e); }
    default List<MockTestResult> findByCategoryAndCreatedAtBetween(String c, LocalDateTime s, LocalDateTime e) { return findByCategoryAndCompletedAtBetween(c, s, e); }
    default List<MockTestResult> findByDifficultyOrderByCreatedAtDesc(String d) { return findByDifficultyOrderByCompletedAtDesc(d); }
    default List<MockTestResult> findByUsernameContainingIgnoreCase(String u) { return List.of(); }
    default List<MockTestResult> findByCategoryAndUsernameContainingIgnoreCase(String c, String u) { return List.of(); }
    default void deleteByCreatedAtBefore(LocalDateTime date) {}
}