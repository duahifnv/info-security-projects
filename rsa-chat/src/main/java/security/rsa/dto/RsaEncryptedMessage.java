package security.rsa.dto;

import java.math.BigInteger;
import java.util.List;

public record RsaEncryptedMessage(String issuerId, String receiverId, List<BigInteger> cryptos) {
}
