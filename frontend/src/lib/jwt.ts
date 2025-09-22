export type JwtPayload = {
  sub: string;
  companyId: string;
  email: string;
  iat?: number;
  exp?: number;
  [k: string]: any;
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}
