package security.rsa.dto;

import java.math.BigInteger;
import java.util.List;

public record RsaEncryptedMessage(String issuerId, List<BigInteger> cryptos) {
}
