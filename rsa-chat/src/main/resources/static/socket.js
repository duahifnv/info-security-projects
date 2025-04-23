const CHAT_SUB_ID = 'sub-0';

let stompSessionId = null
const rsa = generateRsa();

const stompClient = new StompJs.Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

    onConnect: () => {
        console.log('STOMP соединение установлено');

        const transportUrl = stompClient.webSocket._transport.url;
        stompSessionId = transportUrl.split('/').reverse()[1];

        stompClient.subscribe('/topic/chat', (stompMessage) => {
            const jsonMessage = JSON.parse(stompMessage.body);
            addStompMessageToBlock(jsonMessage);
        }, { id: CHAT_SUB_ID } );
    },

    onStompError: (frame) => {
        console.error('Ошибка STOMP:', frame);
    },

    onDisconnect: () => {
        console.log('STOMP соединение закрыто');
    },
    reconnectDelay: 30000 // 30s
});

stompClient.activate();

const sendMessage = () => {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;

    if (!stompClient || !stompClient.connected) {
        console.warn('Невозможно отправить сообщение: STOMP соединение не установлено');
        return;
    }

    if (message.trim()) {
        stompClient.publish({
            destination: '/app/chat',
            body: message,
        });
        messageInput.value = '';
    }
}

const addStompMessageToBlock = (jsonMessage) => {
    const issuerId = jsonMessage['issuerId'];
    const message = jsonMessage['message'];
    const color = issuerId === stompSessionId ? 'darkblue' : 'black';
    const header = issuerId === stompSessionId ? 'Вы' : issuerId;
    addTextToBlock(header, message, color);
}

const addTextToBlock = (header, text, textColor) => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML += `<p style="color: ${textColor}">
                                    <strong>${header.substr(0, 8)}:</strong> ${text}
                              </p>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}