package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Question;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    // Get questions by category
    List<Question> findByCategory(String category);
    
    // Get questions by category and difficulty
    List<Question> findByCategoryAndDifficulty(String category, String difficulty);
    
    // Get questions by category and topic
    List<Question> findByCategoryAndTopic(String category, String topic);
    
    // Get random questions by category
    @Query(value = "SELECT * FROM questions WHERE category = :category ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomByCategory(@Param("category") String category, @Param("limit") int limit);
    
    // Get random questions by category and difficulty
    @Query(value = "SELECT * FROM questions WHERE category = :category AND difficulty = :difficulty ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomByCategoryAndDifficulty(@Param("category") String category, @Param("difficulty") String difficulty, @Param("limit") int limit);
    
    // Get random questions by category and topic
    @Query(value = "SELECT * FROM questions WHERE category = :category AND topic = :topic ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomByCategoryAndTopic(@Param("category") String category, @Param("topic") String topic, @Param("limit") int limit);
    
    // Count questions by category
    long countByCategory(String category);
    
    // Count questions by category and difficulty
    long countByCategoryAndDifficulty(String category, String difficulty);
    
    // Get distinct topics by category
    @Query("SELECT DISTINCT q.topic FROM Question q WHERE q.category = :category AND q.topic IS NOT NULL")
    List<String> findDistinctTopicsByCategory(@Param("category") String category);
}