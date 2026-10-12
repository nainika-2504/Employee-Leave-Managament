package com.company.elms.service;

import com.company.elms.model.LeavePolicy;
import com.company.elms.repository.LeavePolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("null")
@Service
public class PolicyService {

    @Autowired
    private LeavePolicyRepository leavePolicyRepository;

    public static final String KEY_MONTHLY_ACCRUAL = "monthly_accrual_rate";
    public static final String KEY_MAX_CONSECUTIVE_NORMAL = "max_consecutive_normal_days";
    public static final String KEY_MIN_STAFFING_PCT = "min_department_staffing_pct";
    public static final String KEY_OVERDUE_DAYS = "overdue_threshold_days";
    public static final String KEY_CARRY_FORWARD_ENABLED = "carry_forward_enabled";
    public static final String KEY_MAX_CARRY_FORWARD = "max_carry_forward_days";

    public String getPolicy(String key, String defaultValue) {
        return leavePolicyRepository.findByPolicyKey(key)
                .map(LeavePolicy::getPolicyValue)
                .orElse(defaultValue);
    }

    public int getIntPolicy(String key, int defaultValue) {
        try {
            return Integer.parseInt(getPolicy(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public double getDoublePolicy(String key, double defaultValue) {
        try {
            return Double.parseDouble(getPolicy(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public boolean getBooleanPolicy(String key, boolean defaultValue) {
        return Boolean.parseBoolean(getPolicy(key, String.valueOf(defaultValue)));
    }

    public LeavePolicy setPolicy(String key, String value, String description) {
        LeavePolicy policy = leavePolicyRepository.findByPolicyKey(key)
                .orElse(LeavePolicy.builder().policyKey(key).description(description).build());
        policy.setPolicyValue(value);
        if (description != null) {
            policy.setDescription(description);
        }
        return leavePolicyRepository.save(policy);
    }

    public Map<String, String> getAllPolicies() {
        List<LeavePolicy> policies = leavePolicyRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (LeavePolicy p : policies) {
            map.put(p.getPolicyKey(), p.getPolicyValue());
        }
        // Ensure defaults are populated if missing
        map.putIfAbsent(KEY_MONTHLY_ACCRUAL, "1.0");
        map.putIfAbsent(KEY_MAX_CONSECUTIVE_NORMAL, "3");
        map.putIfAbsent(KEY_MIN_STAFFING_PCT, "50");
        map.putIfAbsent(KEY_OVERDUE_DAYS, "3");
        map.putIfAbsent(KEY_CARRY_FORWARD_ENABLED, "true");
        map.putIfAbsent(KEY_MAX_CARRY_FORWARD, "30");
        return map;
    }
}
