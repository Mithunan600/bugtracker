package com.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;
import com.model.Attachment;

@Document(collection = "bugs")
public class Bug {
    @Id
    private String id;
    private String title;
    private String description;
    private String status;
    private String severity;
    private String priority;
    private String reporter;
    private String assignedTo;
    private Date createdAt;
    private Date updatedAt;
    private String version;
    private String commitHash;
    private String branch;
    private String reproductionSteps;
    private List<Attachment> attachments;
    private List<Comment> comments;
    private List<WorkRequest> requests;

    // Constructor to initialize lists
    public Bug() {
        this.comments = new java.util.ArrayList<>();
        this.requests = new java.util.ArrayList<>();
        this.attachments = new java.util.ArrayList<>();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getReporter() { return reporter; }
    public void setReporter(String reporter) { this.reporter = reporter; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getCommitHash() { return commitHash; }
    public void setCommitHash(String commitHash) { this.commitHash = commitHash; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getReproductionSteps() { return reproductionSteps; }
    public void setReproductionSteps(String reproductionSteps) { this.reproductionSteps = reproductionSteps; }
    public List<Attachment> getAttachments() { return attachments; }
    public void setAttachments(List<Attachment> attachments) { this.attachments = attachments; }
    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
    public List<WorkRequest> getRequests() { return requests; }
    public void setRequests(List<WorkRequest> requests) { this.requests = requests; }
}
