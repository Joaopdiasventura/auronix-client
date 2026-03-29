const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PAYMENT_REQUEST_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;
const TRANSFER_KEY_PATH = '/transfer/key';
const PAYMENT_REQUEST_PATH_PATTERN = /^\/payment-request\/([^/]+)$/i;

export type TransferKeyResolution =
  | {
      kind: 'email';
      value: string;
    }
  | {
      kind: 'paymentRequest';
      value: string;
    }
  | {
      kind: 'invalid';
      value: string;
    };

export function resolveTransferKey(rawValue: string): TransferKeyResolution {
  const value = rawValue.trim();

  if (!value) {
    return {
      kind: 'invalid',
      value: '',
    };
  }

  if (looksLikeTransferUrl(value)) {
    const urlResolution = resolveTransferKeyFromUrl(value);
    if (urlResolution) return urlResolution;
  }

  const directResolution = resolveDirectTransferKey(value);
  if (directResolution) return directResolution;

  return {
    kind: 'invalid',
    value,
  };
}

function looksLikeTransferUrl(value: string): boolean {
  return (
    ABSOLUTE_URL_PATTERN.test(value) ||
    value.startsWith('/') ||
    value.includes('/transfer/key') ||
    value.includes('/payment-request/') ||
    value.includes('?')
  );
}

function resolveDirectTransferKey(
  value: string,
): Exclude<TransferKeyResolution, { kind: 'invalid' }> | null {
  if (EMAIL_PATTERN.test(value)) {
    return {
      kind: 'email',
      value: value.toLowerCase(),
    };
  }

  if (PAYMENT_REQUEST_PATTERN.test(value)) {
    return {
      kind: 'paymentRequest',
      value: value.toLowerCase(),
    };
  }

  return null;
}

function resolveTransferKeyFromUrl(rawValue: string): TransferKeyResolution | null {
  const currentOrigin = resolveCurrentOrigin();

  let url: URL;

  try {
    url = new URL(rawValue, currentOrigin);
  } catch {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(rawValue) && url.origin != currentOrigin) {
    return {
      kind: 'invalid',
      value: rawValue,
    };
  }

  const pathname = normalizePathname(url.pathname);

  if (pathname == TRANSFER_KEY_PATH) {
    return resolveTransferKeyFromTransferEntryUrl(url, rawValue);
  }

  const paymentRequestMatch = pathname.match(PAYMENT_REQUEST_PATH_PATTERN);
  if (paymentRequestMatch) {
    const resolution = resolveDirectTransferKey(paymentRequestMatch[1]);
    if (resolution?.kind == 'paymentRequest') return resolution;

    return {
      kind: 'invalid',
      value: rawValue,
    };
  }

  return null;
}

function resolveTransferKeyFromTransferEntryUrl(url: URL, rawValue: string): TransferKeyResolution {
  const email = url.searchParams.get('email')?.trim() || '';
  const paymentRequest = url.searchParams.get('paymentRequest')?.trim() || '';

  if ((email && paymentRequest) || (!email && !paymentRequest)) {
    return {
      kind: 'invalid',
      value: rawValue,
    };
  }

  if (email) {
    return (
      resolveDirectTransferKey(email) || {
        kind: 'invalid',
        value: rawValue,
      }
    );
  }

  const resolution = resolveDirectTransferKey(paymentRequest);
  if (resolution?.kind == 'paymentRequest') return resolution;

  return {
    kind: 'invalid',
    value: rawValue,
  };
}

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/g, '') || '/';
}

function resolveCurrentOrigin(): string {
  if (typeof window == 'undefined') {
    return 'http://localhost';
  }

  return window.location.origin;
}
