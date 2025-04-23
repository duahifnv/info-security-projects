package security.rsa.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import security.rsa.dto.MessageDto;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    @MessageMapping("/chat")
    @SendTo("/topic/chat")
    public MessageDto sendMessageToChat(Message<String> message) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        String trimmedMessage = message.getPayload().trim();
        log.info("Отправляем в чат сообщение '{}' от пользователя {}", trimmedMessage, accessor.getSessionId());
        return new MessageDto(accessor.getSessionId(), trimmedMessage);
    }
}
