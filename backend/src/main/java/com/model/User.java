package com.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import com.model.WorkedBugSummary;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String password; // hashed
    private String role; // "ADMIN" or "USER"

    private List<WorkedBugSummary> workedOnBugs;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public List<WorkedBugSummary> getWorkedOnBugs() { return workedOnBugs; }
    public void setWorkedOnBugs(List<WorkedBugSummary> workedOnBugs) { this.workedOnBugs = workedOnBugs; }
}
