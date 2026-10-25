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

    @Value("${leadora.bootstrap.force-reset:false}")
    private boolean forceReset;

    @Value("${leadora.bootstrap.admin.email:admin@leadora.com}")
    private String adminEmail;

    @Value("${leadora.bootstrap.admin.password:Admin@Leadora2026}")
    private String adminPassword;

    @Value("${leadora.bootstrap.admin.name:System Administrator}")
    private String adminName;

    @Value("${leadora.bootstrap.marketing.password:Marketing@Leadora2026}")
    private String marketingPassword;

    @Value("${leadora.bootstrap.sales.password:Sales@Leadora2026}")
    private String salesPassword;

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

        // One-time recovery: if LEADORA_BOOTSTRAP_FORCE_RESET or BOOTSTRAP_FORCE_RESET is true,
        // re-encode all demo account passwords in-place.
        // This fixes corrupted hashes without deleting users (avoids FK constraint violations).
        if (forceReset) {
            log.warn("LEADORA_BOOTSTRAP_FORCE_RESET is enabled – re-encoding all demo account passwords to ensure valid BCrypt hashes");
        }

        // 1. Bootstrap / Ensure Administrator
        createOrUpdateUser(adminEmail.trim().toLowerCase(), adminName.trim(), adminPassword, Role.ADMIN, "Executive Leadership", "+91 98765 43210");

        // 2. Bootstrap / Ensure Digital Marketing Executive
        createOrUpdateUser("marketing@leadora.com", "Sarah Marketing", marketingPassword, Role.DIGITAL_MARKETING_EXECUTIVE, "Demand Generation", "+91 98765 43211");
        createOrUpdateUser("sarah.marketing@leadora.com", "Sarah Marketing", marketingPassword, Role.DIGITAL_MARKETING_EXECUTIVE, "Demand Generation", "+91 98765 43211");

        // 3. Bootstrap / Ensure Sales Executive
        createOrUpdateUser("sales@leadora.com", "Suresh J", salesPassword, Role.SALES_EXECUTIVE, "Enterprise Sales", "+91 98765 43212");
        createOrUpdateUser("alex.sales@leadora.com", "Alex Vance", salesPassword, Role.SALES_EXECUTIVE, "Enterprise Sales", "+1 (555) 345-6789");
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
            // Only set password hash on initial creation – never overwrite existing hashes
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole(role);
            user.setActive(true);
            userRepository.save(user);
            log.info("Bootstrap: created new demo account [{}] with role [{}]", normalizedEmail, role);
        } else {
            // Existing user – ensure role and active status
            boolean changed = false;
            if (user.getRole() != role) {
                user.setRole(role);
                changed = true;
            }
            if (!user.isActive()) {
                user.setActive(true);
                changed = true;
            }
            // Force-reset mode: re-encode password to fix corrupted hashes
            if (forceReset) {
                user.setPasswordHash(passwordEncoder.encode(password));
                changed = true;
                log.warn("Bootstrap force-reset: re-encoded password for [{}]", normalizedEmail);
            }
            if (changed) {
                userRepository.save(user);
                log.info("Bootstrap: updated existing account [{}]", normalizedEmail);
            } else {
                log.info("Bootstrap: account [{}] already exists, no changes needed", normalizedEmail);
            }
        }
    }
}
