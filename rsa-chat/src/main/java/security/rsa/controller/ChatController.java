package security.rsa.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    @MessageMapping("/chat")
    @SendTo("/topic/chat")
    public String sendMessageToChat(Message<String> message) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        log.info("Отправляем в чат сообщение '{}' от пользователя {}", message.getPayload(), accessor.getSessionId());
        return message.getPayload();
    }
}
