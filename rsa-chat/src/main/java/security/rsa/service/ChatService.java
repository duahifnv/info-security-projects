package security.rsa.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final SimpMessagingTemplate messagingTemplate;
    public String getJson(Map<String, Object> properties) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(properties);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e.getMessage());
        }
    }
    public void sendStompToUser(String queueName, String userId, Object message) {
        String queuePath = String.format("%s-user%s", queueName, userId);
        messagingTemplate.convertAndSend(queuePath, message);
    }
}
