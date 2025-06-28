package com.model;

import java.util.Date;

public class Attachment {
    private String filename;      // stored filename on disk
    private String originalName;  // original name uploaded by user
    private long size;            // file size in bytes
    private Date uploadedAt;      // upload timestamp

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }

    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }

    public Date getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Date uploadedAt) { this.uploadedAt = uploadedAt; }
} 