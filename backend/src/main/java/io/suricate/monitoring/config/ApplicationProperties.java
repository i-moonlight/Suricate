/*
 *  /*
 *  * Copyright 2012-2018 the original author or authors.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 *
 */

package io.suricate.monitoring.config;

import jdk.nashorn.internal.objects.annotations.Getter;
import jdk.nashorn.internal.objects.annotations.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import javax.validation.constraints.NotNull;

@Configuration
@PropertySource("classpath:application.properties")
@ConfigurationProperties(prefix = "application", ignoreInvalidFields = false)
public class ApplicationProperties {

    /**
     * Authentification configuration
     */
    private final Authentication authentication = new Authentication();

    /**
     * Authentication configuration object
     */
    public static class Authentication {
        /***
         * ldap configuration
         */
        private final Ldap ldap = new Ldap();

        private final Jwt jwt = new Jwt();

        public Ldap getLdap() {
            return ldap;
        }

        public Jwt getJwt() {
            return jwt;
        }
    }

    /**
     * Ldap configuration object
     */
    public static class Ldap {
        private String url;
        private String userSearchFilter;
        private String firstNameAttributName;
        private String lastNameAttributName;
        private String mailAttributName;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getUserSearchFilter() {
            return userSearchFilter;
        }

        public void setUserSearchFilter(String userSearchFilter) {
            this.userSearchFilter = userSearchFilter;
        }

        public String getFirstNameAttributName() {
            return firstNameAttributName;
        }

        public void setFirstNameAttributName(String firstNameAttributName) {
            this.firstNameAttributName = firstNameAttributName;
        }

        public String getLastNameAttributName() {
            return lastNameAttributName;
        }

        public void setLastNameAttributName(String lastNameAttributName) {
            this.lastNameAttributName = lastNameAttributName;
        }

        public String getMailAttributName() {
            return mailAttributName;
        }

        public void setMailAttributName(String mailAttributName) {
            this.mailAttributName = mailAttributName;
        }
    }

    public static class Jwt {

        /** Token validity in second */
        @NotNull
        private long tokenValidity;

        /** Token validity in second remember me */
        @NotNull
        private long tokenValidityRememberMe;

        /** Jwt secret */
        @NotNull
        private String secret;

        public long getTokenValidity() {
            return tokenValidity;
        }
        public void setTokenValidity(long tokenValidity) {
            this.tokenValidity = tokenValidity;
        }

        public long getTokenValidityRememberMe() {
            return tokenValidityRememberMe;
        }
        public void setTokenValidityRememberMe(long tokenValidityRememberMe) {
            this.tokenValidityRememberMe = tokenValidityRememberMe;
        }

        public String getSecret() {
            return secret;
        }
        public void setSecret(String secret) {
            this.secret = secret;
        }
    }


    public Authentication getAuthentication() {
        return authentication;
    }
}
