package com.company.elms.service;

import com.company.elms.model.User;
import com.company.elms.model.LeaveBalance;
import com.company.elms.repository.UserRepository;
import com.company.elms.repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt.get();
        }
        throw new RuntimeException("Invalid email or password.");
    }

    public List<LeaveBalance> getBalancesByUserId(Long userId) {
        return leaveBalanceRepository.findByUserId(userId);
    }

    public List<LeaveBalance> getAllBalances() {
        return leaveBalanceRepository.findAll();
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
