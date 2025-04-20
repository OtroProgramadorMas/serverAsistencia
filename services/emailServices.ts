// deno-lint-ignore no-deprecated-deno-api
if (!Deno.writeAll) {
  // @ts-ignore - Ignoramos el error de TypeScript
  Deno.writeAll = async function(writer, data) {
    let nwritten = 0;
    while (nwritten < data.length) {
      nwritten += await writer.write(data.subarray(nwritten));
    }
    return nwritten;
  };
}

// Modifica tu archivo emailServices.ts

import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Servicio de envío de emails utilizando SMTP para envío real
 */
export class EmailService {
  // Último código enviado (para pruebas)
  public static lastCodeSent: string = "";
  
  /**
   * Envía un correo electrónico real usando SMTP
   */
  public static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Extraer el código de verificación del texto o HTML
      const codeMatch = (options.html || options.text).match(/\d{6}/);
      EmailService.lastCodeSent = codeMatch ? codeMatch[0] : "";
      
      // Crear un nuevo cliente SMTP para cada envío
      const client = new SmtpClient();
      
      try {
        // Configurar la conexión SMTP
        await client.connectTLS({
          hostname: "smtp.gmail.com",
          port: 465,
          username: "jpber2720@gmail.com",
          password: "xcny qnug uwau isei",
        });
        
        // Enviar el email con formato correcto
        await client.send({
          from: "jpber2720@gmail.com",
          to: options.to,
          subject: options.subject,
          html: options.html, // Usa directamente la propiedad html
          content: options.text, // Y el content para texto plano
        });
        
        // Cerrar la conexión
        await client.close();
        
        console.log("=== CORREO ENVIADO EXITOSAMENTE ===");
        console.log(`A: ${options.to}`);
        console.log(`Asunto: ${options.subject}`);
        console.log(`Código enviado: ${EmailService.lastCodeSent}`);
        
        return true;
      } finally {
        // Asegurarse de cerrar la conexión incluso si hay errores
        try {
          await client.close();
        } catch (e) {
          // Ignorar errores al cerrar
        }
      }
    } catch (error) {
      console.error("Error al enviar email:", error);
      return false;
    }
  }
  
  // Método para obtener el último código enviado (para pruebas)
  public static getLastCodeSent(): string {
    return EmailService.lastCodeSent;
  }
}