package io.suricate.monitoring.controllers.api.error;


import com.fasterxml.jackson.databind.ObjectMapper;
import io.suricate.monitoring.model.enums.ApiErrorEnum;
import io.suricate.monitoring.model.dto.error.ApiErrorDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class ApiAuthenticationFailureHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    /**
     * Class LOGGER
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiAuthenticationFailureHandler.class);


    @Override
    public void commence(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, AuthenticationException e) throws IOException, ServletException {
        resolveException(httpServletRequest, httpServletResponse, e);
    }

    @Override
    public void handle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, AccessDeniedException e) throws IOException, ServletException {
        resolveException(httpServletRequest, httpServletResponse, e);
    }

    /**
     * @param httpServletRequest
     * @param httpServletResponse
     * @param e
     * @throws IOException
     */
    private static void resolveException(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, RuntimeException e) throws IOException {
        String path = httpServletRequest.getRequestURI().substring(httpServletRequest.getContextPath().length());
        LOGGER.debug("Authentication error - {}", path, e);

        // Format response
        httpServletResponse.setStatus(ApiErrorEnum.AUTHENTICATION_ERROR.getStatus().value());
        httpServletResponse.setHeader("Content-type", "application/json");

        ObjectMapper obj = new ObjectMapper();
        obj.writeValue(httpServletResponse.getOutputStream(), new ApiErrorDto(ApiErrorEnum.AUTHENTICATION_ERROR));
    }
}