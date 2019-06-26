export interface JWKSMock {
    start(): void;
    stop(): Promise<void>;
    kid(): string;
    token(token: {}): string;
}
declare const createJWKSMock: (jwksOrigin: string, jwksPath?: string) => JWKSMock;
export default createJWKSMock;
