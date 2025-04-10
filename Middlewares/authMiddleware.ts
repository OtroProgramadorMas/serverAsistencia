import { Middleware } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { verify } from "../Dependencies/dependencias.ts";

const secretKey = "M!st.3r!0";

const crypto_secretKey = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(secretKey),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"],
);
export const authMiddleware: Middleware = async (ctx, next) => {
  const { response, request } = ctx;

  try {
    const authHeader = request.headers.get("Authorization");
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      response.status = 401;
      response.body = { message: "No autorizado" };
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verify(token, crypto_secretKey);

    console.log("Token verificado. Payload:", payload); // <--- AGREGA ESTO

    ctx.state.user = payload;
    await next();

  } catch (err) {
    console.error("Error al verificar token:", err); // <--- AGREGA ESTO TAMBIÉN
    response.status = 401;
    response.body = { message: "Token invalido o expirado" };
  }
};

/*
export const authMiddleware: Middleware = async (ctx, next) => {
  const { response, request } = ctx;

  try {
    const authHeader = request.headers.get("Authorization");
    console.log(authHeader);

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      response.status = 401;
      response.body = {
        message: "No autorizado",
      };
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verify(token, crypto_secretKey);
    ctx.state.user = payload;

    await next();
  } catch {
    response.status = 401;
    response.body = {
      message: "Token invalido o expirado",
    };
  }
};
*/