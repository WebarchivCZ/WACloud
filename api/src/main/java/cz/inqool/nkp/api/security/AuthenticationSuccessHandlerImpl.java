package cz.inqool.nkp.api.security;

import java.io.IOException;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.inqool.nkp.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;


@Component
public class AuthenticationSuccessHandlerImpl implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        userRepository.updateLastLogin(new Date());

        ObjectMapper mapper = new ObjectMapper();
        try {
            response.getWriter().println(mapper.writeValueAsString(((AppUserPrincipal)authentication.getPrincipal()).getAppUser()));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}