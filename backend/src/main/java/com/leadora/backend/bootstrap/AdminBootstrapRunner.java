package com.leadora.backend.bootstrap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.model.Role;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.UserRepository;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${leadora.bootstrap.admin.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${leadora.bootstrap.admin.email:admin@leadora.com}")
    private String adminEmail;

    @Value("${leadora.bootstrap.admin.password:Admin@Leadora2026}")
    private String adminPassword;

    @Value("${leadora.bootstrap.admin.name:System Administrator}")
    private String adminName;

    public AdminBootstrapRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!bootstrapEnabled) {
            log.info("Admin bootstrap is disabled via configuration.");
            return;
        }

        // 1. Bootstrap / Ensure Administrator
        createOrUpdateUser(adminEmail.trim().toLowerCase(), adminName.trim(), adminPassword, Role.ADMIN, "Executive Leadership", "+91 98765 43210");

        // 2. Bootstrap / Ensure Digital Marketing Executive
        createOrUpdateUser("marketing@leadora.com", "Sarah Marketing", "Marketing@Leadora2026", Role.DIGITAL_MARKETING_EXECUTIVE, "Demand Generation", "+91 98765 43211");
        createOrUpdateUser("sarah.marketing@leadora.com", "Sarah Marketing", "Marketing@Leadora2026", Role.DIGITAL_MARKETING_EXECUTIVE, "Demand Generation", "+91 98765 43211");

        // 3. Bootstrap / Ensure Sales Executive
        createOrUpdateUser("sales@leadora.com", "Suresh J", "Sales@Leadora2026", Role.SALES_EXECUTIVE, "Enterprise Sales", "+91 98765 43212");
        createOrUpdateUser("alex.sales@leadora.com", "Alex Vance", "Sales@Leadora2026", Role.SALES_EXECUTIVE, "Enterprise Sales", "+1 (555) 345-6789");
    }

    private void createOrUpdateUser(String email, String name, String password, Role role, String department, String phone) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(normalizedEmail);
            user.setName(name);
            user.setDepartment(department);
            user.setPhone(phone);
        }
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
        log.info("Demo account ensured: [{}] with role [{}]", normalizedEmail, role);
    }
}
