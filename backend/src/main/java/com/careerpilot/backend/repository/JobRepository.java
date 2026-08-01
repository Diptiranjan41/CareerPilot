package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    
    @Query(value = "SELECT * FROM jobs j WHERE j.is_active = 1 " +
           "AND (j.employment_type = :employmentType OR j.employment_type = 'Both') " +
           "AND (j.job_type = :jobType OR j.job_type = 'Both') " +
           "ORDER BY " +
           "CASE WHEN j.title LIKE CONCAT('%', COALESCE(:role, ''), '%') THEN 1 ELSE 0 END DESC, " +
           "j.id LIMIT 20", nativeQuery = true)
    List<Job> findRecommendations(@Param("employmentType") String employmentType,
                                   @Param("jobType") String jobType,
                                   @Param("role") String role);
    
    @Query(value = "SELECT * FROM jobs j WHERE j.is_active = 1 " +
           "AND (j.employment_type = :employmentType OR j.employment_type = 'Both') " +
           "AND (j.job_type = :jobType OR j.job_type = 'Both') " +
           "ORDER BY j.id LIMIT 20", nativeQuery = true)
    List<Job> findByEmploymentAndJobType(@Param("employmentType") String employmentType,
                                          @Param("jobType") String jobType);
    
    // Test method to get all jobs
    @Query(value = "SELECT * FROM jobs WHERE is_active = 1", nativeQuery = true)
    List<Job> getAllActiveJobs();
}