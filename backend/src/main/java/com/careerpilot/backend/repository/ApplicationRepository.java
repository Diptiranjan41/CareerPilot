package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Application;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.entity.Job;
import com.careerpilot.backend.entity.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Find by User
    List<Application> findByUser(User user);

    // Find by User and Status
    List<Application> findByUserAndStatus(User user, String status);

    // Find by User and Job
    List<Application> findByUserAndJob(User user, Job job);

    // Find by User and Internship
    List<Application> findByUserAndInternship(User user, Internship internship);

    // Find by User ID
    @Query("SELECT a FROM Application a WHERE a.user.id = :userId")
    List<Application> findByUserId(@Param("userId") Long userId);

    // Find by Status
    @Query("SELECT a FROM Application a WHERE a.status = :status")
    List<Application> findByStatus(@Param("status") String status);

    // Find by Job ID
    @Query("SELECT a FROM Application a WHERE a.job.id = :jobId")
    List<Application> findByJobId(@Param("jobId") Long jobId);

    // Find by Internship ID
    @Query("SELECT a FROM Application a WHERE a.internship.id = :internshipId")
    List<Application> findByInternshipId(@Param("internshipId") Long internshipId);
}
