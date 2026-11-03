import { NodeCryptoTokenGenerator } from '@infrastructure/cryptography';

describe('NodeCryptoTokenGenerator', () => {
  const generator = new NodeCryptoTokenGenerator();

  it('generates 32 random bytes as base64url', () => {
    const token = generator.generate();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generator.generate()).not.toBe(token);
  });

  it('hashes a token as a stable hex SHA-256', () => {
    const token = generator.generate();
    const hash = generator.hash(token);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(generator.hash(token)).toBe(hash);
    expect(generator.hash(generator.generate())).not.toBe(hash);
  });
});
