// deno-lint-ignore-file
import { enviarCorreoRecuperacion } from "../Helpers/emailService.ts";
import { generarCodigo, validarEmail, validarPassword } from "../Helpers/utils.ts";
import * as passwordRecoveryModel from "../Models/passwordRecoveryModel.ts";

// Constantes desde el modelo
const EN_DESARROLLO = true; // Usar la misma constante que en el modelo

export const solicitarRecuperacion = async (ctx: any) => {
  const { request, response } = ctx;
  console.log("=====================================================");
  console.log("INICIO: solicitarRecuperacion");
  console.log("=====================================================");

  if (!request.hasBody) {
    console.log("ERROR: No hay cuerpo en la solicitud");
    response.status = 400;
    response.body = { success: false, msg: "No se proporcionaron datos" };
    return;
  }

  try {
    console.log("Intentando leer el cuerpo de la solicitud...");
    
    const bodyValue = await request.body({ type: "json" });
    const body = await bodyValue.value;
    console.log("Cuerpo recibido:", JSON.stringify(body));
    
    const { email } = body || {};

    if (!email) {
      console.log("ERROR: Falta el email en la solicitud");
      response.status = 400;
      response.body = { success: false, msg: "El correo electrónico es requerido" };
      return;
    }

    console.log(`Procesando recuperación para email: ${email}`);

    // Validar formato de correo
    console.log("Validando formato de email...");
    if (!validarEmail(email)) {
      console.log(`ERROR: Formato de email inválido: ${email}`);
      response.status = 400;
      response.body = { success: false, msg: "Formato de correo electrónico inválido" };
      return;
    }
    console.log("Formato de email válido");

    // Verificar si el usuario existe en la base de datos
    console.log("Verificando si el usuario existe...");
    const usuario = await passwordRecoveryModel.buscarUsuarioPorEmail(email);
    if (!usuario) {
      console.log(`ADVERTENCIA: No se encontró usuario con el email: ${email}`);
      // Por seguridad, no informamos al cliente que el usuario no existe
      // Simulamos éxito pero no enviamos correo
      response.status = 200;
      response.body = {
        success: true,
        msg: "Si el correo existe en nuestra base de datos, recibirá instrucciones para restablecer su contraseña."
      };
      return;
    }
    console.log(`Usuario encontrado: ${JSON.stringify(usuario)}`);

    console.log("Generando código...");
    const codigo = generarCodigo(6);
    console.log(`Código generado: ${codigo}`);

    // Intenta guardar el código en la base de datos
    console.log("Intentando guardar código en base de datos...");
    try {
      const exito = await passwordRecoveryModel.guardarCodigoRecuperacion(email, codigo);
      if (!exito) {
        console.log("ERROR: Fallo al guardar código en la base de datos");
        response.status = 500;
        response.body = {
          success: false,
          msg: "Error al guardar el código de recuperación",
          debug: "Fallo en guardarCodigoRecuperacion"
        };
        return;
      }
      console.log("Código guardado correctamente en base de datos");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      console.error("ERROR DETALLADO al guardar código:", errorMsg);
      response.status = 500;
      response.body = {
        success: false,
        msg: "Error al guardar el código en la base de datos",
        debug: errorMsg
      };
      return;
    }

    // Imprime el código en la consola
    console.log("\n===========================================");
    console.log(`CÓDIGO DE RECUPERACIÓN PARA ${email}: ${codigo}`);
    console.log("===========================================\n");

    // Intentar enviar correo electrónico
    console.log("Intentando enviar correo electrónico...");
    try {
      const enviado = await enviarCorreoRecuperacion(email, codigo);
      console.log(`Resultado del envío de correo: ${enviado ? "ÉXITO" : "FALLO"}`);

      if (!enviado) {
        console.log("ADVERTENCIA: No se pudo enviar el correo, pero el código se guardó correctamente");
        // Por ahora, seguimos adelante aunque el correo falle
      }
    } catch (emailError) {
      const errorMsg = emailError instanceof Error ? emailError.message : "Error desconocido";
      console.error("ERROR al enviar correo:", errorMsg);
      // No devolvemos error al cliente, continuamos para ver el código en la consola
    }

    // Responder éxito para desarrollo
    console.log("Enviando respuesta de éxito al cliente");
    response.status = 200;
    response.body = {
      success: true,
      msg: "Se ha enviado un código de recuperación a su correo electrónico",
      // Solo en desarrollo, mostramos el código para facilitar las pruebas
      devInfo: EN_DESARROLLO ? {
        codigo: codigo,
        email: email
      } : undefined
    };

    console.log("=====================================================");
    console.log("FIN: solicitarRecuperacion (exitoso)");
    console.log("=====================================================");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("=====================================================");
    console.error("ERROR CRÍTICO en solicitarRecuperacion:", errorMsg);
    console.error("Stack:", error instanceof Error ? error.stack : "No disponible");
    console.error("=====================================================");

    response.status = 500;
    response.body = {
      success: false,
      msg: "Error interno del servidor al procesar su solicitud",
      debug: EN_DESARROLLO ? errorMsg : undefined
    };
  }
};

/**
 * Verifica que el código proporcionado sea válido
 */
export const verificarCodigo = async (ctx: any) => {
  const { request, response } = ctx;
  console.log("=====================================================");
  console.log("INICIO: verificarCodigo");
  console.log("=====================================================");

  if (!request.hasBody) {
    console.log("ERROR: No hay cuerpo en la solicitud");
    response.status = 400;
    response.body = { success: false, msg: "No se proporcionaron datos" };
    return;
  }

  try {
    console.log("Intentando leer el cuerpo de la solicitud...");
    // Leer directamente el body
    let body;
    try {
      body = await request.body.value;
      console.log("Cuerpo recibido:", JSON.stringify(body));
    } catch (error) {
      console.error("Error al leer el cuerpo:", error);
      response.status = 400;
      response.body = { success: false, msg: "Error al procesar la solicitud. Asegúrate de enviar JSON válido." };
      return;
    }
    
    const { email, codigo } = body || {};

    if (!email || !codigo) {
      console.log("ERROR: Faltan datos requeridos");
      response.status = 400;
      response.body = { success: false, msg: "El correo electrónico y el código son requeridos" };
      return;
    }

    console.log(`Verificando código ${codigo} para el email ${email}...`);
    // Verificar código
    const esValido = await passwordRecoveryModel.verificarCodigoRecuperacion(email, codigo);

    console.log(`Resultado de verificación: ${esValido ? "VÁLIDO" : "INVÁLIDO"}`);

    if (!esValido) {
      // Registrar intento fallido por seguridad
      console.warn(`Intento fallido de verificación de código para ${email} - Código ingresado: ${codigo}`);

      response.status = 400;
      response.body = { success: false, msg: "Código inválido o expirado" };
      return;
    }

    // Registrar verificación exitosa
    console.log(`Código verificado correctamente para ${email}`);

    response.status = 200;
    response.body = { success: true, msg: "Código verificado correctamente" };

    console.log("=====================================================");
    console.log("FIN: verificarCodigo (exitoso)");
    console.log("=====================================================");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("=====================================================");
    console.error("ERROR CRÍTICO en verificarCodigo:", errorMsg);
    console.error("Stack:", error instanceof Error ? error.stack : "No disponible");
    console.error("=====================================================");

    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor al verificar el código" };
  }
};

/**
 * Cambia la contraseña del usuario después de verificar el código
 */
export const cambiarPassword = async (ctx: any) => {
  const { request, response } = ctx;
  console.log("=====================================================");
  console.log("INICIO: cambiarPassword");
  console.log("=====================================================");

  if (!request.hasBody) {
    console.log("ERROR: No hay cuerpo en la solicitud");
    response.status = 400;
    response.body = { success: false, msg: "No se proporcionaron datos" };
    return;
  }

  try {
    console.log("Intentando leer el cuerpo de la solicitud...");
    // Leer directamente el body
    let body;
    try {
      body = await request.body.value;
      console.log("Cuerpo recibido (sin mostrar contraseña):", JSON.stringify({
        ...body,
        nuevaPassword: body.nuevaPassword ? "********" : undefined
      }));
    } catch (error) {
      console.error("Error al leer el cuerpo:", error);
      response.status = 400;
      response.body = { success: false, msg: "Error al procesar la solicitud. Asegúrate de enviar JSON válido." };
      return;
    }
    
    const { email, codigo, nuevaPassword } = body || {};

    if (!email || !codigo || !nuevaPassword) {
      console.log("ERROR: Faltan datos requeridos");
      response.status = 400;
      response.body = { success: false, msg: "Todos los campos son requeridos" };
      return;
    }

    // Validar la nueva contraseña
    console.log("Validando nueva contraseña...");
    const validacionPassword = validarPassword(nuevaPassword);
    if (!validacionPassword.valido) {
      console.log(`ERROR: Contraseña inválida: ${validacionPassword.mensaje}`);
      response.status = 400;
      response.body = { success: false, msg: validacionPassword.mensaje };
      return;
    }
    console.log("Nueva contraseña válida");

    // Verificar código nuevamente
    console.log(`Verificando código ${codigo} para el email ${email}...`);
    const esValido = await passwordRecoveryModel.verificarCodigoRecuperacion(email, codigo);

    console.log(`Resultado de verificación: ${esValido ? "VÁLIDO" : "INVÁLIDO"}`);

    if (!esValido) {
      console.warn(`Intento fallido de cambio de contraseña para ${email} - Código inválido o expirado`);
      response.status = 400;
      response.body = { success: false, msg: "Código inválido o expirado" };
      return;
    }

    // Buscar usuario para determinar si es aprendiz o funcionario
    console.log("Buscando usuario por email...");
    const usuario = await passwordRecoveryModel.buscarUsuarioPorEmail(email);

    if (!usuario) {
      console.log(`ERROR: No se encontró un usuario con el email: ${email}`);
      response.status = 404;
      response.body = { success: false, msg: "No se encontró un usuario con ese correo electrónico" };
      return;
    }
    console.log(`Usuario encontrado: ${JSON.stringify(usuario)}`);

    let exito;

    // Actualizar contraseña según el tipo de usuario
    console.log(`Actualizando contraseña para ${usuario.tipo} con email: ${email}...`);
    if (usuario.tipo === 'aprendiz') {
      exito = await passwordRecoveryModel.actualizarPasswordAprendiz(email, nuevaPassword);
      console.log(`Resultado de actualización para aprendiz: ${exito ? "ÉXITO" : "FALLO"}`);
    } else {
      exito = await passwordRecoveryModel.actualizarPasswordFuncionario(email, nuevaPassword);
      console.log(`Resultado de actualización para funcionario: ${exito ? "ÉXITO" : "FALLO"}`);
    }

    if (!exito) {
      console.log("ERROR: No se pudo actualizar la contraseña");
      response.status = 500;
      response.body = { success: false, msg: "Error al actualizar la contraseña" };
      return;
    }

    // Marcar el código como usado para evitar reutilización
    console.log("Marcando código como usado...");
    await passwordRecoveryModel.marcarCodigoComoUsado(email, codigo);
    console.log("Código marcado como usado correctamente");

    response.status = 200;
    response.body = { success: true, msg: "Contraseña actualizada correctamente" };

    console.log("=====================================================");
    console.log("FIN: cambiarPassword (exitoso)");
    console.log("=====================================================");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error("=====================================================");
    console.error("ERROR CRÍTICO en cambiarPassword:", errorMsg);
    console.error("Stack:", error instanceof Error ? error.stack : "No disponible");
    console.error("=====================================================");

    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor al cambiar la contraseña" };
  }
};