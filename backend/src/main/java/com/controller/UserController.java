package com.controller;

import com.model.User;
import com.model.Bug;
import com.repository.UserRepository;
import com.repository.BugRepository;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BugRepository bugRepository;
    @Autowired
    private UserService userService;

    // Get user profile by email
    @GetMapping("/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        return userOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update user profile (name, role only)
    @PutMapping("/{email}")
    public ResponseEntity<?> updateUserByEmail(@PathVariable String email, @RequestBody User updates) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        if (updates.getName() != null) user.setName(updates.getName());
        if (updates.getRole() != null) user.setRole(updates.getRole());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // Bugs currently assigned to user and not resolved/closed
    @GetMapping("/{email}/bugs/working-on")
    public List<Bug> getBugsWorkingOn(@PathVariable String email) {
        return bugRepository.findByAssignedTo(email).stream()
                .filter(bug -> !"Resolved".equalsIgnoreCase(bug.getStatus()) && !"Closed".equalsIgnoreCase(bug.getStatus()))
                .collect(Collectors.toList());
    }

    // Bugs previously assigned and resolved/closed, or commented by user
    @GetMapping("/{email}/bugs/worked-on")
    public List<Bug> getBugsWorkedOn(@PathVariable String email) {
        List<Bug> assignedDone = bugRepository.findByAssignedTo(email).stream()
                .filter(bug -> "Resolved".equalsIgnoreCase(bug.getStatus()) || "Closed".equalsIgnoreCase(bug.getStatus()))
                .collect(Collectors.toList());
        List<Bug> commented = bugRepository.findAll().stream()
                .filter(bug -> bug.getComments() != null && bug.getComments().stream().anyMatch(c -> email.equalsIgnoreCase(c.getAuthor())))
                .collect(Collectors.toList());
        // Merge and deduplicate
        assignedDone.addAll(commented.stream().filter(b -> assignedDone.stream().noneMatch(x -> x.getId().equals(b.getId()))).collect(Collectors.toList()));
        return assignedDone;
    }
} 