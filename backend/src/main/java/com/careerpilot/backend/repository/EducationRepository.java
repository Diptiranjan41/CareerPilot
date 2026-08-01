package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByUser_IdOrderByDisplayOrderAsc(Long userId);
    void deleteByUser_Id(Long userId);
}