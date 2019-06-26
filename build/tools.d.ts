import * as forge from 'node-forge';
export interface JWKS {
    keys: [{
        alg: string;
        kty: string;
        use: string;
        x5c: [string];
        n: string;
        e: string;
        kid: string;
        x5t: string;
    }];
}
export declare const createCertificate: ({ publicKey, privateKey, jwksOrigin, }: {
    publicKey: forge.pki.PublicKey;
    privateKey: forge.pki.PrivateKey;
    jwksOrigin?: string | undefined;
}) => string;
export declare const createJWKS: ({ privateKey, publicKey, jwksOrigin, }: {
    privateKey: forge.pki.PrivateKey;
    publicKey: forge.pki.PublicKey;
    jwksOrigin?: string | undefined;
}) => JWKS;
export declare const createKeyPair: () => {
    privateKey: forge.pki.PrivateKey;
    publicKey: forge.pki.PublicKey;
};
export interface JwtPayload {
    sub?: string;
    iss?: string;
    aud?: string;
    exp?: string;
    nbf?: string;
    iat?: string;
    jti?: string;
}
export declare const signJwt: (privateKey: forge.pki.PrivateKey, jwtPayload: JwtPayload, kid?: string | undefined) => string;
