import { resolveTransferKey } from './resolve-transfer-key';

describe('resolveTransferKey', () => {
  const origin = window.location.origin;

  it('accepts direct email keys', () => {
    expect(resolveTransferKey('Maria@Auronix.com')).toEqual({
      kind: 'email',
      value: 'maria@auronix.com',
    });
  });

  it('accepts transfer entry urls with payment request params', () => {
    expect(
      resolveTransferKey(
        `${origin}/transfer/key?paymentRequest=550E8400-E29B-41D4-A716-446655440000`,
      ),
    ).toEqual({
      kind: 'paymentRequest',
      value: '550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('accepts relative transfer entry urls with email params', () => {
    expect(resolveTransferKey('/transfer/key?email=Joao@Auronix.com')).toEqual({
      kind: 'email',
      value: 'joao@auronix.com',
    });
  });

  it('accepts legacy payment request links', () => {
    expect(resolveTransferKey('/payment-request/550e8400-e29b-41d4-a716-446655440000')).toEqual({
      kind: 'paymentRequest',
      value: '550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('rejects external hosts', () => {
    expect(
      resolveTransferKey('https://app.example.com/transfer/key?email=joao@auronix.com'),
    ).toEqual({
      kind: 'invalid',
      value: 'https://app.example.com/transfer/key?email=joao@auronix.com',
    });
  });

  it('rejects ambiguous transfer entry urls', () => {
    expect(
      resolveTransferKey(
        '/transfer/key?email=joao@auronix.com&paymentRequest=550e8400-e29b-41d4-a716-446655440000',
      ),
    ).toEqual({
      kind: 'invalid',
      value:
        '/transfer/key?email=joao@auronix.com&paymentRequest=550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('rejects empty payloads', () => {
    expect(resolveTransferKey('   ')).toEqual({
      kind: 'invalid',
      value: '',
    });
  });
});
