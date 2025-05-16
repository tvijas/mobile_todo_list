package com.example.kuby;

import com.example.kuby.foruser.UserRepo;
import com.example.kuby.security.models.request.LoginRequest;
import com.example.kuby.security.models.request.SignUpRequest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = {KubyApplication.class}, properties = {"spring.profiles.active=test"})
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UserAuthControllerTests extends TestContainersInitializer {

    //    @Value("${spring.mail.username}")
    private String email = "test@email.com";
    private static String authHeader;
    private static String refreshToken;
    @Autowired
    private MockMvc mvc;
    private final ObjectMapper objMapper = new ObjectMapper();

    @Test
    @Order(1)
    void test_register_verify_login() throws Exception {
        SignUpRequest signUpRequest = new SignUpRequest(email, "fsfsDSF@545AADFDGEWE3AR");

        mvc.perform(post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objMapper.writeValueAsString(signUpRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest(email, "fsfsDSF@545AADFDGEWE3AR");

        mvc.perform(post("/api/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Authorization"))
                .andExpect(header().exists("X-Refresh-Token"))
                .andExpect(var1 -> authHeader = var1.getResponse().getHeader("Authorization"))
                .andExpect(var1 -> refreshToken = var1.getResponse().getHeader("X-Refresh-Token"))
                .andDo(print());
    }

    @Order(2)
    @RepeatedTest(5)
    void test_secured_endpoint_success() throws Exception {
        mvc.perform(post("/testing")
                        .header("Authorization", authHeader))
                .andExpect(status().isNoContent());
    }

    @Order(3)
    @RepeatedTest(5)
    void test_refresh_token_success() throws Exception {
        mvc.perform(post("/api/user/token/refresh")
                        .header("X-Refresh-Token", refreshToken)
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(var1 -> authHeader = var1.getResponse().getHeader("Authorization"))
                .andExpect(var1 -> refreshToken = var1.getResponse().getHeader("X-Refresh-Token"));
    }
}
