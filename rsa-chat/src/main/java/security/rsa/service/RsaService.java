package security.rsa.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import security.rsa.dto.RsaEncryptedMessage;
import security.rsa.dto.RsaPublic;

import java.math.BigInteger;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RsaService {
    private final Map<String, RsaPublic> usersRsa;
    public Map<String, RsaPublic> getUsersRsa() {
        return Map.copyOf(usersRsa);
    }
    public void addUserRsa(RsaPublic rsaPublic) {
        usersRsa.put(rsaPublic.issuerId(), rsaPublic);
    }
    public void removeUserRsa(String userId) {
        usersRsa.remove(userId);
    }
    public String decryptMessage(RsaEncryptedMessage message) {
        RsaPublic receiverRsa = usersRsa.get(message.receiverId());
        List<BigInteger> cryptos = message.cryptos();
        var characters = decryptNumbers(cryptos, receiverRsa);
        return String.valueOf(characters);
    }
    private List<Character> decryptNumbers(List<BigInteger> cryptos, RsaPublic rsa) {
        List<BigInteger> decryptedNumbers =
                cryptos.stream()
                        .map(c -> c.modPow(rsa.publicKey(), rsa.module()))
                        .toList();
        return decryptedNumbers.stream()
                .map(n -> (char) n.intValue())
                .toList();
    }
}
