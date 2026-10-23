import { DomainError } from '@personal-dashboard/shared/errors';
import { PhoneNumber } from '@domain/common';

describe('PhoneNumber', () => {
  it.each(['11987654321', '(11) 98765-4321', '+55 11 98765-4321'])(
    'normalizes %j to digits',
    (raw) => {
      expect(PhoneNumber.create(raw).value).toBe('11987654321');
    },
  );

  it.each(['', '1198765432', '1187654321', '01987654321', '10987654321'])(
    'rejects %j',
    (raw) => {
      expect(() => PhoneNumber.create(raw)).toThrow(DomainError);
    },
  );
});
