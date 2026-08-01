package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.TestAttempt;
import com.careerpilot.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByUser(User user);
    List<TestAttempt> findByUser_Id(Long userId);
    List<TestAttempt> findByUserAndCategory(User user, String category);
    default List<TestAttempt> findByStudentId(Long userId) { return findByUser_Id(userId); }
}