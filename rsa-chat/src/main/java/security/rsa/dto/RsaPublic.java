package security.rsa.dto;

import java.math.BigInteger;

public record RsaPublic(String issuerId, BigInteger publicKey, BigInteger module) {
}
