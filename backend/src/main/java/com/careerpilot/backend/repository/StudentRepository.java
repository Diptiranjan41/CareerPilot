package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByUserEmail(String email);
    Optional<Student> findByUser_Email(String email);

    default Optional<Student> findByEmail(String email) {
        return findByUser_Email(email);
    }
}