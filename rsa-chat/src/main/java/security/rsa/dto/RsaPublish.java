package security.rsa.dto;

import java.math.BigInteger;

public record RsaPublish(String issuerId, BigInteger publicKey, BigInteger module) {
}
