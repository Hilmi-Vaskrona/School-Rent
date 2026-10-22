/**
 * Regex validasi UUID PostgreSQL (format 8-4-4-4-12 hex).
 * Menerima baik UUIDv4 standar maupun format ID seed mock bawaan database
 * (contoh: e0000000-0000-0000-0000-000000000001).
 */
export const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
