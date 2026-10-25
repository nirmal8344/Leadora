package com.leadora.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leadora.backend.model.Role;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class AuthControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void testInitialAdminBootstrapCreatedUser() {
        boolean adminExists = userRepository.existsByRole(Role.ADMIN);
        assertThat(adminExists).isTrue();

        User admin = userRepository.findByEmailIgnoreCase("admin@leadora.com").orElse(null);
        assertThat(admin).isNotNull();
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.isActive()).isTrue();
    }

    @Test
    void testSuccessfulLogin() throws Exception {
        String loginJson = """
            {
                "email": "admin@leadora.com",
                "password": "Admin@Leadora2026"
            }
            """;

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("admin@leadora.com")))
                .andExpect(jsonPath("$.data.user.role", is("ADMIN")));
    }

    @Test
    void testLoginWithWrongPassword() throws Exception {
        String loginJson = """
            {
                "email": "admin@leadora.com",
                "password": "WrongPassword123"
            }
            """;

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    void testLoginWithMissingFields() throws Exception {
        String invalidJson = """
            {
                "email": "",
                "password": ""
            }
            """;

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email", notNullValue()));
    }

    @Test
    void testMeWithoutAuthenticationShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testMeWithValidTokenShouldReturnUserProfile() throws Exception {
        // 1. Log in to get token
        String loginJson = """
            {
                "email": "admin@leadora.com",
                "password": "Admin@Leadora2026"
            }
            """;

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = jsonNode.path("data").path("token").asText();
        assertThat(token).isNotBlank();

        // 2. Access /api/v1/auth/me with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is("admin@leadora.com")))
                .andExpect(jsonPath("$.data.role", is("ADMIN")));
    }

    @Test
    void testLogoutRevokesToken() throws Exception {
        // 1. Log in
        String loginJson = """
            {
                "email": "admin@leadora.com",
                "password": "Admin@Leadora2026"
            }
            """;

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = jsonNode.path("data").path("token").asText();

        // 2. Perform Logout
        mockMvc.perform(post("/api/v1/auth/logout")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 3. Attempting /me with the revoked token must now fail with 401
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testForgotPasswordFlow() throws Exception {
        String requestJson = """
            {
                "email": "admin@leadora.com"
            }
            """;

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void testResetPasswordWithInvalidTokenShouldReturn400() throws Exception {
        String resetJson = """
            {
                "token": "completely-invalid-nonexistent-token",
                "newPassword": "NewStrongPassword2026!"
            }
            """;

        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(resetJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Invalid or expired password reset token")));
    }
}
