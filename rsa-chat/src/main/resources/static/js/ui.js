const chat = (header, text, textColor) => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML += `<p style="color: ${textColor}">
                                    <strong>${header.substr(0, 8)}:</strong> ${text}
                              </p>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

const rsaLog = (text) => {
    log('RSA', text, 'white')
}

const serverLog = (text) => {
    log('SERVER', text, 'violet')
}

const log = (status, text, textColor) => {
    const logsDiv = document.getElementById('logs');
    logsDiv.innerHTML += `<p style="color: ${textColor}"><strong>${status.toUpperCase()}</strong>: ${text}</p>`;
    logsDiv.scrollTop = logsDiv.scrollHeight;
}

const sendChatInput = () => {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;

    if (message.trim()) {
        const cryptos = encryptText(message, clientRsa);

        const jsonData = JSON.stringify({
            'issuerId': stompSessionId,
            'cryptos': Array.from(cryptos)
        });

        sendStompMessage('/app/chat', jsonData)
        messageInput.value = '';
    }
}