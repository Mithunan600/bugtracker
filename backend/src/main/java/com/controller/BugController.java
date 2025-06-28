package com.controller;

import com.model.Bug;
import com.model.Comment;
import com.model.WorkRequest;
import com.model.Attachment;
import com.service.BugService;
import com.service.UserService;
import com.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bugs")
public class BugController {
    @Autowired
    private BugService bugService;
    @Autowired
    private UserService userService;
    @Autowired
    private MailService mailService;

    @GetMapping
    public List<Bug> getAllBugs() {
        return bugService.getAllBugs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bug> getBug(@PathVariable String id) {
        Optional<Bug> bug = bugService.getBugById(id);
        return bug.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Bug createBug(@RequestBody Bug bug, Authentication auth) {
        bug.setReporter(auth.getName());
        return bugService.createBug(bug);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bug> updateBug(@PathVariable String id, @RequestBody Map<String, Object> updates, Authentication auth) {
        Optional<Bug> existingOpt = bugService.getBugById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        Bug toUpdate = existingOpt.get();
        // Only reporter or admin can update
        if (!toUpdate.getReporter().equals(auth.getName()) && !auth.getAuthorities().toString().contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        // Merge updates
        if (updates.containsKey("title")) toUpdate.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) toUpdate.setDescription((String) updates.get("description"));
        if (updates.containsKey("status")) toUpdate.setStatus((String) updates.get("status"));
        if (updates.containsKey("severity")) toUpdate.setSeverity((String) updates.get("severity"));
        if (updates.containsKey("priority")) toUpdate.setPriority((String) updates.get("priority"));
        if (updates.containsKey("assignedTo")) toUpdate.setAssignedTo((String) updates.get("assignedTo"));
        if (updates.containsKey("reproductionSteps")) toUpdate.setReproductionSteps((String) updates.get("reproductionSteps"));
        if (updates.containsKey("version")) toUpdate.setVersion((String) updates.get("version"));
        if (updates.containsKey("commitHash")) toUpdate.setCommitHash((String) updates.get("commitHash"));
        if (updates.containsKey("branch")) toUpdate.setBranch((String) updates.get("branch"));
        if (updates.containsKey("attachments")) {
            List<?> rawList = (List<?>) updates.get("attachments");
            List<com.model.Attachment> attachments = new java.util.ArrayList<>();
            for (Object obj : rawList) {
                if (obj instanceof Map) {
                    Map map = (Map) obj;
                    com.model.Attachment att = new com.model.Attachment();
                    att.setFilename((String) map.get("filename"));
                    att.setOriginalName((String) map.get("originalName"));
                    Object sizeObj = map.get("size");
                    if (sizeObj instanceof Number) {
                        att.setSize(((Number) sizeObj).longValue());
                    }
                    Object uploadedAtObj = map.get("uploadedAt");
                    if (uploadedAtObj instanceof Number) {
                        att.setUploadedAt(new java.util.Date(((Number) uploadedAtObj).longValue()));
                    } else if (uploadedAtObj instanceof String) {
                        try {
                            att.setUploadedAt(java.util.Date.from(java.time.OffsetDateTime.parse((String) uploadedAtObj).toInstant()));
                        } catch (Exception ignore) {}
                    }
                    attachments.add(att);
                }
            }
            toUpdate.setAttachments(attachments);
        }
        if (updates.containsKey("comments")) toUpdate.setComments((List<com.model.Comment>) updates.get("comments"));
        if (updates.containsKey("requests")) toUpdate.setRequests((List<com.model.WorkRequest>) updates.get("requests"));
        // updatedAt always
        toUpdate.setUpdatedAt(new java.util.Date());
        return ResponseEntity.ok(bugService.updateBug(toUpdate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBug(@PathVariable String id, Authentication auth) {
        Optional<Bug> bug = bugService.getBugById(id);
        if (bug.isEmpty()) return ResponseEntity.notFound().build();
        // Only reporter or admin can delete
        if (!bug.get().getReporter().equals(auth.getName()) && !auth.getAuthorities().toString().contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        bugService.deleteBug(id);
        return ResponseEntity.ok().build();
    }

    // Add comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Comment comment, Authentication auth) {
        try {
            Optional<Bug> bugOpt = bugService.getBugById(id);
            if (bugOpt.isEmpty()) return ResponseEntity.notFound().build();
            Bug bug = bugOpt.get();
            
            // Initialize comments list if null
            if (bug.getComments() == null) {
                bug.setComments(new java.util.ArrayList<>());
            }
            
            comment.setAuthor(auth.getName());
            comment.setTimestamp(new java.util.Date());
            bug.getComments().add(comment);
            bugService.updateBug(bug);
            return ResponseEntity.ok(bug);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding comment: " + e.getMessage());
        }
    }

    // Add work request (now using 'requests' field)
    @PostMapping("/{id}/requests")
    public ResponseEntity<?> addRequest(@PathVariable String id, @RequestBody WorkRequest request, Authentication auth) {
        Optional<Bug> bugOpt = bugService.getBugById(id);
        if (bugOpt.isEmpty()) return ResponseEntity.notFound().build();
        Bug bug = bugOpt.get();
        if (bug.getRequests() == null) bug.setRequests(new java.util.ArrayList<>());
        request.setAuthor(auth.getName());
        request.setStatus("pending");
        bug.getRequests().add(request);
        bugService.updateBug(bug);
        return ResponseEntity.ok(bug);
    }

    // Approve/reject work request (by index, using 'requests' field)
    @PutMapping("/{id}/requests/{reqIndex}")
    public ResponseEntity<?> updateRequest(@PathVariable String id, @PathVariable int reqIndex, @RequestParam String status, Authentication auth) {
        Optional<Bug> bugOpt = bugService.getBugById(id);
        if (bugOpt.isEmpty()) return ResponseEntity.notFound().build();
        Bug bug = bugOpt.get();
        // Only reporter or admin can approve/reject
        if (!bug.getReporter().equals(auth.getName()) && !auth.getAuthorities().toString().contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        bug.getRequests().get(reqIndex).setStatus(status);
        if ("approved".equalsIgnoreCase(status)) {
            // Assign the bug to the author of the approved request
            String toEmail = bug.getRequests().get(reqIndex).getAuthor();
            bug.setAssignedTo(toEmail);
            mailService.sendAssignmentMail(toEmail, bug.getTitle());
        }
        bugService.updateBug(bug);
        return ResponseEntity.ok(bug);
    }

    // Get all requests for a bug
    @GetMapping("/{id}/requests")
    public ResponseEntity<?> getRequests(@PathVariable String id, Authentication auth) {
        Optional<Bug> bugOpt = bugService.getBugById(id);
        if (bugOpt.isEmpty()) return ResponseEntity.notFound().build();
        Bug bug = bugOpt.get();
        return ResponseEntity.ok(bug.getRequests() != null ? bug.getRequests() : new java.util.ArrayList<>());
    }

    // Get all bugs assigned to the current user
    @GetMapping("/assigned")
    public List<Bug> getAssignedBugs(Authentication auth) {
        String username = auth.getName();
        return bugService.getAllBugs().stream()
            .filter(bug -> bug.getAssignedTo() != null &&
                (bug.getAssignedTo().equalsIgnoreCase(username)))
            .collect(Collectors.toList());
    }

    // Get all comments for a bug
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable String id) {
        Optional<Bug> bugOpt = bugService.getBugById(id);
        if (bugOpt.isEmpty()) return ResponseEntity.notFound().build();
        Bug bug = bugOpt.get();
        return ResponseEntity.ok(bug.getComments() != null ? bug.getComments() : new java.util.ArrayList<>());
    }

    // Download file
    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<?> downloadFile(@PathVariable String filename) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", filename);
            java.io.File file = filePath.toFile();
            
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = java.nio.file.Files.readAllBytes(filePath);
            String contentType = determineContentType(filename);
            
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(fileContent);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error downloading file: " + e.getMessage());
        }
    }
    
    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "pdf": return "application/pdf";
            case "doc": return "application/msword";
            case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls": return "application/vnd.ms-excel";
            case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "jpg":
            case "jpeg": return "image/jpeg";
            case "png": return "image/png";
            case "gif": return "image/gif";
            case "txt": return "text/plain";
            case "zip": return "application/zip";
            case "rar": return "application/x-rar-compressed";
            default: return "application/octet-stream";
        }
    }

    // Upload file
    @PostMapping("/files/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = uploadDir.resolve(filename);
            try (java.io.InputStream is = file.getInputStream()) {
                java.nio.file.Files.copy(is, filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
            Attachment attachment = new Attachment();
            attachment.setFilename(filename);
            attachment.setOriginalName(file.getOriginalFilename());
            attachment.setSize(file.getSize());
            attachment.setUploadedAt(new java.util.Date());
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error for debugging
            return ResponseEntity.status(500).body("Error uploading file: " + e.getMessage());
        }
    }

    // DEV ONLY: Delete all bugs
    @DeleteMapping("/dev/clear-bugs")
    public ResponseEntity<?> clearAllBugs() {
        bugService.deleteAllBugs();
        return ResponseEntity.ok("All bugs deleted.");
    }
}
