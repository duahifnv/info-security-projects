package security.rsa.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Component
@Slf4j
public class StompHandler {
    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        var headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("Клиент подсоединен по веб-сокету. Session ID: {}", headerAccessor.getSessionId());
    }
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        var accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        log.info("Клиент отсоединен от веб-сокета. Session ID: {}, Команда отключения: {}",
                sessionId, accessor.getCommand());
    }
    @EventListener
    public void handleSessionSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("Клиент {} подписался на: {}", accessor.getSessionId(), accessor.getDestination());
    }
}
