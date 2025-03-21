import { Context } from "../Dependencies/dependencias.ts";

export const logData = async (ctx: Context, next: () => Promise<unknown>) => {
  console.log("Nueva solicitud recibida:");
  console.log(`Método: ${ctx.request.method}`);
  console.log(`URL: ${ctx.request.url}`);

  if (ctx.request.hasBody) {
    try {
      const body = await ctx.request.body;
      console.log("Cuerpo:", body);
    } catch (error) {
      console.log("Error al leer el cuerpo de la solicitud:", (error as Error).message);
    }
  } else {
    console.log("Cuerpo: No hay contenido en la solicitud");
  }

  await next(); // Continúa con el siguiente middleware
};