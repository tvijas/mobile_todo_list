package com.example.kuby.security.filter;

import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.example.kuby.foruser.CustomUserDetails;
import com.example.kuby.security.context.TokenClaimContext;
import com.example.kuby.security.models.enums.TokenType;
import com.example.kuby.security.service.jwt.JwtValidatorService;
import com.example.kuby.security.util.PermittedUrls;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import static com.example.kuby.security.util.parsers.AuthHeaderParser.recoverToken;
import static com.example.kuby.security.util.parsers.jwt.JwtPayloadParser.getUserDetailsFromClaims;
import static com.example.kuby.security.util.parsers.jwt.JwtPayloadParser.parsePayloadFromDecodedJwt;


@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtValidatorService jwtValidatorService;
    private final PermittedUrls permittedUrls;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("Request url: " + request.getRequestURL());
        if (permittedUrls.isPermitAllRequest(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<String> token = recoverToken(request);
        if (token.isEmpty()) {
            response.setStatus(401);
            return;
        }

        Optional<DecodedJWT> optionalDecodedAccessToken = jwtValidatorService
                .validateToken(token.get(), TokenType.ACCESS);

        if (optionalDecodedAccessToken.isEmpty()) {
            response.setStatus(401);
            return;
        }

        DecodedJWT decodedAccessToken = optionalDecodedAccessToken.get();
        Map<String, Claim> claims = parsePayloadFromDecodedJwt(decodedAccessToken);
        CustomUserDetails userDetails = getUserDetailsFromClaims(claims);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails.getPrincipal(), null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        TokenClaimContext.set(claims);

        filterChain.doFilter(request, response);

        TokenClaimContext.clear();
    }
}
