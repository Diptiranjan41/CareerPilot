package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByStatus(String status);
    List<Internship> findByInternshipType(String internshipType);

    @Query("SELECT i FROM Internship i WHERE i.skillsRequired LIKE %:skill%")
    List<Internship> findBySkill(@Param("skill") String skill);
}