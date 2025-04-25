const CHAT_SUB_ID = 'sub-0';
const RSA_INIT_SUB_ID = 'sub-1';
const RSA_PUBLISH_SUB_ID = 'sub-2';
const USERS_SUB_ID = 'sub-3';

let clientSessionId = null

const stompClient = new StompJs.Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

    onConnect: () => {
        console.log('STOMP соединение установлено');

        const transportUrl = stompClient.webSocket._transport.url;
        clientSessionId = transportUrl.split('/').reverse()[1];

        if (!clientSessionId) {
            console.error('Не удалось получить ID сессии пользователя');
            return;
        }
        setUserId(clientSessionId);

        subscribeStomp('/user/queue/chat', (stompMessage) => {
            const jsonMessage = JSON.parse(stompMessage.body);
            handleEncryptedMessageJson(jsonMessage);
        }, CHAT_SUB_ID);

        subscribeStomp('/user/queue/rsa', (stompMessage) => {
            const jsonMessage = JSON.parse(stompMessage.body);
            initUsersRsa(jsonMessage);
        }, RSA_INIT_SUB_ID);
        sendStompMessage('/app/users.rsa');

        sendStompMessage(
            '/app/rsa',
            JSON.stringify({
                'issuerId': clientSessionId,
                'publicKey': clientRsa.publicKey.toString(),
                'module': clientRsa.module.toString()
            }),
        );

        subscribeStomp('/topic/rsa', (stompMessage) => {
            const jsonMessage = JSON.parse(stompMessage.body);
            handleRsaJson(jsonMessage);
        }, RSA_PUBLISH_SUB_ID);

        subscribeStomp('/topic/users.logout', (stompMessage) => {
            const jsonMessage = JSON.parse(stompMessage.body);
            handleUserLogoutJson(jsonMessage);
        }, USERS_SUB_ID);
    },

    onStompError: (frame) => {
        console.error('Ошибка STOMP:', frame);
    },

    onDisconnect: () => {
        console.log('STOMP соединение закрыто');
        sendStompMessage(
            '/topic/users.logout',
            JSON.stringify({
                'userId': clientSessionId
            }),
        );
        clientSessionId = null;
    },
    reconnectDelay: 30000 // 30s
});

stompClient.activate();

const subscribeStomp = (destination, callback, sub_id) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('Невозможно подписаться: STOMP соединение не установлено');
        return;
    }
    stompClient.subscribe(destination, callback, { id: sub_id } );
}

const sendStompMessage = (destination, payload) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('Невозможно отправить сообщение: STOMP соединение не установлено');
        return;
    }
    stompClient.publish({
        destination: destination,
        body: payload
    });
}

const handleEncryptedMessageJson = (jsonMessage) => {
    const issuerId = jsonMessage['issuerId'];
    const cryptos = jsonMessage['cryptos'];

    let decryptedMessage;
    try {
        decryptedMessage = decryptText(cryptos, clientRsa);
    } catch (e) {
        console.error(`Ошибка расшифровки сообщения ${cryptos} от пользователя ${issuerId}: ${e}`);
        return;
    }
    printChatMessage(issuerId, decryptedMessage);
}

const initUsersRsa = (jsonMessage) => {
    const updatedUsersRsa = jsonMessage['users'];
    Object.entries(updatedUsersRsa)
        .filter(([userId]) => userId !== clientSessionId)
        .forEach(([userId, rsa]) => {
            addUserRsa(userId, {
                'publicKey': rsa.publicKey,
                'module': rsa.module
            });
    });
};

const handleRsaJson = (jsonMessage) => {
    const issuerId = jsonMessage['issuerId'];
    if (issuerId !== clientSessionId) {
        addUserRsa(issuerId, {
            'publicKey': jsonMessage['publicKey'],
            'module': jsonMessage['module']
        });
    }
}

const handleUserLogoutJson = (jsonMessage) => {
    const userId = jsonMessage['userId'];
    deleteUserRsa(userId);
}