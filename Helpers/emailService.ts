import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// Configuración del servidor SMTP (actualizar con tus credenciales reales)
const SMTP_CONFIG = {
  hostname: "smtp.gmail.com",
  port: 465,
  username: "tu-correo-real@gmail.com", 
  password: "tu-contraseña-de-aplicación", // Contraseña de aplicación para Gmail
  tls: true
};

// Verificar si estamos en modo desarrollo
export const EN_DESARROLLO = false; // Cambia a false en producción

/**
 * Envía un correo electrónico
 * @param destinatario Dirección de correo del destinatario
 * @param asunto Asunto del correo
 * @param contenido Contenido del correo (texto plano o HTML)
 * @param esHtml Indica si el contenido es HTML
 * @returns Booleano que indica si el envío fue exitoso
 */
export const enviarCorreo = async (
  destinatario: string,
  asunto: string,
  contenido: string,
  esHtml: boolean = false
): Promise<boolean> => {
  console.log("\n=== INICIO: enviarCorreo ===");
  console.log("Destinatario:", destinatario);
  console.log("Asunto:", asunto);
  console.log("Es HTML:", esHtml);
  
  // En desarrollo, simulamos el envío
  if (EN_DESARROLLO) {
    console.log("\nMODO DESARROLLO: Simulando envío de correo");
    console.log("---------------------------------------");
    console.log(`Para: ${destinatario}`);
    console.log(`Asunto: ${asunto}`);
    console.log("Contenido (resumido):", contenido.substring(0, 150) + "...");
    console.log("---------------------------------------");
    console.log("=== FIN: enviarCorreo (simulado en desarrollo) ===\n");
    return true;
  }

  try {
    console.log(`Enviando correo a: ${destinatario}`);
    
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_CONFIG.hostname,
        port: SMTP_CONFIG.port,
        tls: SMTP_CONFIG.tls,
        auth: {
          username: SMTP_CONFIG.username,
          password: SMTP_CONFIG.password
        }
      }
    });
    
    await client.send({
      from: SMTP_CONFIG.username,
      to: destinatario,
      subject: asunto,
      html: esHtml ? contenido : undefined,
      content: !esHtml ? contenido : undefined,
    });
    
    console.log("Correo enviado exitosamente");
    return true;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return false;
  }
};


/**
 * Envía un correo electrónico
 * @param destinatario Dirección de correo del destinatario
 * @param asunto Asunto del correo
 * @param contenido Contenido del correo (texto plano o HTML)
 * @param esHtml Indica si el contenido es HTML
 * @returns Booleano que indica si el envío fue exitoso
 */

/**
 * Genera un contenido HTML para el correo de recuperación de contraseña
 * @param codigo Código de verificación
 * @returns HTML formateado para el correo
 */
export const generarHTMLRecuperacion = (codigo: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 15px;
        }
        .codigo {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 30px 0;
          letter-spacing: 5px;
          color: #1a237e;
        }
        .footer {
          font-size: 12px;
          color: #777;
          margin-top: 30px;
          text-align: center;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Recuperación de Contraseña - SENA</h2>
        </div>
        
        <p>Has solicitado restablecer tu contraseña en el Sistema de Asistencia SENA.</p>
        
        <p>Utiliza el siguiente código para verificar tu identidad:</p>
        
        <div class="codigo">${codigo}</div>
        
        <p>Este código expirará en 15 minutos por razones de seguridad.</p>
        
        <p>Si no has solicitado este cambio, puedes ignorar este mensaje o contactar al administrador del sistema.</p>
        
        <div class="footer">
          <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          <p>&copy; 2025 Sistema de Asistencia SENA. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Función específica para enviar correos de recuperación de contraseña
 * @param destinatario Dirección de correo del destinatario
 * @param codigo Código de verificación
 * @returns Booleano que indica si el envío fue exitoso
 */
export const enviarCorreoRecuperacion = async (
  destinatario: string,
  codigo: string
): Promise<boolean> => {
  try {
    console.log(`Iniciando envío de correo de recuperación a ${destinatario} con código ${codigo}`);
    const asunto = "Recuperación de Contraseña - Sistema SENA";
    const contenidoHTML = generarHTMLRecuperacion(codigo);
    
    return await enviarCorreo(destinatario, asunto, contenidoHTML, true);
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error);
    return false;
  }
};