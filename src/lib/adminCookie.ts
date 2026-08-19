// Легка, Edge-сумісна константа без залежності від node:crypto —
// імпортується і в middleware.ts (Edge runtime), і в Node-шарі автентифікації.
export const ADMIN_COOKIE_NAME = "dianna_admin_session";
