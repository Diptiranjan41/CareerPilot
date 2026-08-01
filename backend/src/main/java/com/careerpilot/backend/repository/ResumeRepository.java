package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    
    List<Resume> findAllByOrderByUpdatedAtDesc();
    
    List<Resume> findByUserIdOrderByUpdatedAtDesc(Long userId);
    
    @Query("SELECT r FROM Resume r WHERE r.fullName LIKE %:name%")
    List<Resume> searchByFullName(@Param("name") String name);
    
    long countByUserId(Long userId);
}