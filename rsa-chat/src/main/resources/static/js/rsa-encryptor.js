const clientRsa = generateRandomRsa();
const usersRsa = {};

const encryptText = (text, publicRsa) => {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(text);
    console.log(`Raw uint8: ${uint8Array}`)
    const cryptoArray = [];
    for (const charCode of uint8Array) {
        const encrypted = encryptNumber(charCode, publicRsa);
        cryptoArray.push(encrypted);
    }
    console.log(`Encoded uint8: ${cryptoArray}`)
    return cryptoArray;
}

const encryptNumber = (number, publicRsa) => {
    let bigIntNumber = BigInt(number);
    const encrypted = modPow(bigIntNumber, publicRsa.publicKey, publicRsa.module);
    return Number(encrypted);
}

const decryptText = (cryptoArray, privateRsa) => {
    const decryptArray = [];
    for (const crypto of cryptoArray) {
        const decrypted = decryptCrypto(crypto, privateRsa);
        decryptArray.push(decrypted);
    }
    const uint8Array = new Uint8Array(decryptArray);
    console.log(`Decrypted uint8: ${uint8Array}`);

    const decoder = new TextDecoder('utf-8');
    return decoder.decode(uint8Array);
}

const decryptCrypto = (crypto, privateRsa) => {
    let bigIntCrypto = BigInt(crypto);
    const decrypted = modPow(bigIntCrypto, privateRsa.privateKey, privateRsa.module);
    return Number(decrypted);
}