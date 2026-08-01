package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    
    Optional<Certificate> findByCertificateId(String certificateId);
    
    List<Certificate> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<Certificate> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Add this method - it was missing
    List<Certificate> findByCategory(String category);
    
    @Query("SELECT c FROM Certificate c WHERE c.userId = :userId AND c.category = :category ORDER BY c.createdAt DESC")
    List<Certificate> findLatestByUserAndCategory(@Param("userId") Long userId, @Param("category") String category);
    
    @Query("SELECT COUNT(c) FROM Certificate c WHERE c.percentage > :percentage")
    Integer countBetterScores(@Param("percentage") Double percentage);
}