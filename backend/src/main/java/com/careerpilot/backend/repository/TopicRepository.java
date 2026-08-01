package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByCategory(String category);
    List<Topic> findAllByOrderByNameAsc();
    default List<Topic> findByOrderByPriorityAsc() { return findAllByOrderByNameAsc(); }
}