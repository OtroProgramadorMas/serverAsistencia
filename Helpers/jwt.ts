import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const secretKey = "M!st.3r!0"


const crypto_secretKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    {name: "HMAC", hash: "SHA-256"},
    false,
    ["sign", "verify"],
);

export const generarToken = async(userID: string) =>{
    return await create(
        {alg:"HS256", typ:"JWT"},
        {userID, exp: getNumericDate(60*60)}, // Duracion del token
        crypto_secretKey,
    );
}