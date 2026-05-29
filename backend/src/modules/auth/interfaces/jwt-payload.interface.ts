export interface JwtPayload {
  sub: string;        // User ID
  email: string;      // User email
  tenantId: string;   // Current tenant ID
  roles: string[];    // User roles
  iat?: number;       // Issued at
  exp?: number;       // Expiration time
}