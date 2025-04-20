import { PasswordRecoveryModel } from "../Models/emailModels.ts";
import { EmailService } from "../services/emailServices.ts";

// Controlador para solicitar código de recuperación
export const solicitarCodigoRecuperacion = async (ctx: any) => {
  const { response, request } = ctx;
  
  try {
    let body;
    try {
      body = await request.body.json();
    } catch (jsonError) {
      console.error("Error al parsear JSON:", jsonError);
      response.status = 400;
      response.body = { 
        message: "JSON inválido. Asegúrate de enviar un JSON correcto sin comentarios.", 
        error: jsonError 
      };
      return;
    }
    
    const email = body.email;
    
    if (!email) {
      response.status = 400;
      response.body = { message: "El correo electrónico es requerido" };
      return;
    }
    
    // Verificar si el email existe en alguna de las tablas
    const esAprendiz = await PasswordRecoveryModel.verificarAprendiz(email);
    const esFuncionario = await PasswordRecoveryModel.verificarFuncionario(email);
    
    if (!esAprendiz && !esFuncionario) {
      response.status = 404;
      response.body = { message: "El correo electrónico no está registrado" };
      return;
    }
    
    // Determinar el tipo de usuario
    const tipoUsuario = esAprendiz ? "aprendiz" : "funcionario";
    
    // Generar y guardar código de verificación
    const codigo = PasswordRecoveryModel.guardarCodigo(email, tipoUsuario);
    
    // Preparar el contenido del email con el código más visible
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .header { text-align: center; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    .code-box { background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
    .code { font-size: 32px; font-weight: bold; color: #4A90E2; letter-spacing: 2px; }
    .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Recuperación de Contraseña</h2>
    </div>
    
    <p>Hola,</p>
    <p>Has solicitado un código para recuperar tu contraseña. Usa el siguiente código para completar el proceso:</p>
    
    <div class="code-box">
      <div class="code">${codigo}</div>
    </div>
    
    <p>Este código expirará en <strong>15 minutos</strong>.</p>
    <p>Si no solicitaste este código, por favor ignora este correo.</p>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    // Enviar email con el código
    const asunto = "Código de Verificación: " + codigo;
    const mensajeTexto = `CÓDIGO DE RECUPERACIÓN: ${codigo}
    
Has solicitado un código para recuperar tu contraseña.
Este código expirará en 15 minutos.
Si no solicitaste este código, por favor ignora este correo.`;
    
    const emailEnviado = await EmailService.sendEmail({
      to: email,
      subject: asunto,
      text: mensajeTexto,
      html: htmlContent
    });
    
    if (emailEnviado) {
      response.status = 200;
      response.body = { 
        message: "Código de verificación enviado al correo electrónico",
        email: email,
        // En desarrollo, mostrar el código para facilitar pruebas
        codigo: codigo
      };
      
      console.log(`Código enviado a ${email}: ${codigo}`);
    } else {
      response.status = 500;
      response.body = { message: "Error al enviar el correo electrónico" };
    }
    
  } catch (error) {
    console.error("Error en el servidor:", error);
    response.status = 500;
    response.body = { message: "Error en el servidor: " + error };
  }
};

// Controlador para verificar código y actualizar contraseña
export const verificarCodigoYActualizarPassword = async (ctx: any) => {
  const { response, request } = ctx;
  
  try {
    let body;
    try {
      body = await request.body.json();
    } catch (jsonError) {
      console.error("Error al parsear JSON:", jsonError);
      response.status = 400;
      response.body = { 
        message: "JSON inválido. Asegúrate de enviar un JSON correcto sin comentarios.", 
        error: jsonError
      };
      return;
    }
    
    const { email, codigo, nuevaPassword } = body;
    
    if (!email || !codigo || !nuevaPassword) {
      response.status = 400;
      response.body = { message: "Email, código y nueva contraseña son requeridos" };
      return;
    }
    
    console.log(`Intentando verificar: Email: ${email}, Código: ${codigo}`);
    
    // Verificar código
    const esCodigoValido = PasswordRecoveryModel.verificarCodigo(email, codigo);
    
    if (!esCodigoValido) {
      response.status = 400;
      response.body = { message: "Código inválido o expirado" };
      return;
    }
    
    console.log("Código verificado correctamente");
    
    // Obtener tipo de usuario
    const tipoUsuario = PasswordRecoveryModel.getTipoUsuario(email);
    
    if (!tipoUsuario) {
      response.status = 400;
      response.body = { message: "No se encontró información del usuario" };
      return;
    }
    
    console.log(`Tipo de usuario: ${tipoUsuario}`);
    
    // Actualizar contraseña según el tipo de usuario
    let actualizacionExitosa = false;
    
    if (tipoUsuario === "aprendiz") {
      console.log("Actualizando contraseña de aprendiz");
      actualizacionExitosa = await PasswordRecoveryModel.actualizarPasswordAprendiz(email, nuevaPassword);
    } else if (tipoUsuario === "funcionario") {
      console.log("Actualizando contraseña de funcionario");
      actualizacionExitosa = await PasswordRecoveryModel.actualizarPasswordFuncionario(email, nuevaPassword);
    }
    
    if (actualizacionExitosa) {
      console.log("Contraseña actualizada correctamente");
      response.status = 200;
      response.body = { message: "Contraseña actualizada correctamente" };
    } else {
      console.log("Error al actualizar la contraseña");
      response.status = 500;
      response.body = { message: "Error al actualizar la contraseña" };
    }
    
  } catch (error) {
    console.error("Error en el servidor:", error);
    response.status = 500;
    response.body = { message: "Error en el servidor: " + error };
  }
};