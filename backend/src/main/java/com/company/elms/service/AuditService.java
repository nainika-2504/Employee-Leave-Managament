package com.company.elms.service;

import com.company.elms.model.AuditLog;
import com.company.elms.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("null")
@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, Long entityId, String performedBy, String details) {
        AuditLog entry = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .performedBy(performedBy != null ? performedBy : "SYSTEM")
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(entry);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
