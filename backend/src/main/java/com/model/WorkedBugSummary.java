package com.model;

import java.util.Date;

public class WorkedBugSummary {
    private String bugId;
    private String title;
    private String status;
    private Date deletedAt;

    public WorkedBugSummary() {}
    public WorkedBugSummary(String bugId, String title, String status, Date deletedAt) {
        this.bugId = bugId;
        this.title = title;
        this.status = status;
        this.deletedAt = deletedAt;
    }
    public String getBugId() { return bugId; }
    public void setBugId(String bugId) { this.bugId = bugId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Date deletedAt) { this.deletedAt = deletedAt; }
} 