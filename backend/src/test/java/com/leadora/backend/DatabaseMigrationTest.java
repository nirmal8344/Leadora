package com.leadora.backend;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DatabaseMigrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void migrationShouldCreateAllRequiredTables() {
        List<String> requiredTables = List.of(
            "users",
            "password_reset_tokens",
            "lead_sources",
            "campaigns",
            "leads",
            "lead_qualifications",
            "lead_assignments",
            "follow_ups",
            "lead_activities",
            "conversions",
            "lost_leads",
            "marketing_content",
            "landing_pages",
            "campaign_expenses",
            "notifications",
            "audit_logs"
        );

        for (String table : requiredTables) {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?",
                Integer.class,
                table
            );
            assertThat(count)
                .withFailMessage("Table '%s' should exist after migration", table)
                .isEqualTo(1);
        }
    }

    @Test
    void defaultLeadSourcesShouldBeSeeded() {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT count(*) FROM lead_sources",
            Integer.class
        );
        assertThat(count)
            .withFailMessage("Lead sources should be seeded")
            .isGreaterThanOrEqualTo(10);
    }
}
