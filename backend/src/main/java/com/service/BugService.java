package com.service;

import com.model.Bug;
import com.repository.BugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BugService {
    @Autowired
    private BugRepository bugRepository;

    public List<Bug> getAllBugs() {
        return bugRepository.findAll();
    }

    public Optional<Bug> getBugById(String id) {
        return bugRepository.findById(id);
    }

    public Bug createBug(Bug bug) {
        bug.setCreatedAt(new Date());
        bug.setUpdatedAt(new Date());
        // Ensure lists are initialized
        if (bug.getComments() == null) bug.setComments(new java.util.ArrayList<>());
        if (bug.getRequests() == null) bug.setRequests(new java.util.ArrayList<>());
        if (bug.getAttachments() == null) bug.setAttachments(new java.util.ArrayList<>());
        return bugRepository.save(bug);
    }

    public Bug updateBug(Bug bug) {
        bug.setUpdatedAt(new Date());
        // Ensure lists are initialized
        if (bug.getComments() == null) bug.setComments(new java.util.ArrayList<>());
        if (bug.getRequests() == null) bug.setRequests(new java.util.ArrayList<>());
        if (bug.getAttachments() == null) bug.setAttachments(new java.util.ArrayList<>());
        return bugRepository.save(bug);
    }

    public void deleteBug(String id) {
        bugRepository.deleteById(id);
    }

    public void deleteAllBugs() {
        bugRepository.deleteAll();
    }
}
