package security.rsa.service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import security.rsa.dto.RsaPublic;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RsaConfig {
    @Bean
    public Map<String, RsaPublic> usersRsa() {
        return new HashMap<>();
    }
}
