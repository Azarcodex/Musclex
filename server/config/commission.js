import "dotenv/config";
export const DEFAULT_COMMISSION_PERCENT = Number(
  process.env.ADMIN_COMMISSION_PERCENT || 10
);
