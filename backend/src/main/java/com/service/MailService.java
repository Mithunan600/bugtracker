package com.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendAssignmentMail(String to, String bugTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Bug Assignment Notification");
            message.setText("This bug has been assigned to you: " + bugTitle + "\nPlease start working on it professionally.");
            mailSender.send(message);
        } catch (Exception e) {
            // Log the error, but do not crash the app
            System.err.println("Failed to send assignment email to " + to + ": " + e.getMessage());
        }
    }
} 