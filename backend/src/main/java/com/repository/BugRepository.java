package com.repository;

import com.model.Bug;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BugRepository extends MongoRepository<Bug, String> {
    List<Bug> findByReporter(String reporter);
    List<Bug> findByAssignedTo(String assignedTo);
}
