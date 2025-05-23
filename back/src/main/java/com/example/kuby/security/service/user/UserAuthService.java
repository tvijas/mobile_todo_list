package com.example.kuby.security.service.user;

import com.example.kuby.exceptions.BasicException;
import com.example.kuby.foruser.CustomUserPrincipal;
import com.example.kuby.foruser.UserEntity;
import com.example.kuby.foruser.UserService;
import com.example.kuby.security.models.enums.Provider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserAuthService {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    @Transactional
    public void createLocalUserAndSendSubmissionLink(String email, String password) {
        userService.createLocalUser(email, password);
    }

    @Transactional
    public CustomUserPrincipal authenticate(String email, String password, Provider provider) {
        CustomUserPrincipal customUserPrincipal = new CustomUserPrincipal(email, provider);
        UsernamePasswordAuthenticationToken usernamePassword = new UsernamePasswordAuthenticationToken(customUserPrincipal, password);
        Authentication authUser = authenticationManager.authenticate(usernamePassword);

        if (!authUser.isAuthenticated())
            throw new BasicException(Map.of("email_or_password", "Email or password isn't correct"), HttpStatus.NOT_FOUND);

        if (authUser instanceof CredentialsContainer container)
            container.eraseCredentials();

        return (CustomUserPrincipal) authUser.getPrincipal();
    }
}
