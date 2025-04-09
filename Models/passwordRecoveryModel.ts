// deno-lint-ignore-file
import { Conexion } from "./conexion.ts";
import { hash } from "../Helpers/utils.ts";

// Verificar si estamos en modo desarrollo
export const EN_DESARROLLO = false; // Cambia a false en producción

// En modo desarrollo, almacenamos códigos en memoria
interface CodigoRecuperacion {
  email: string;
  codigo: string;
  fechaCreacion: Date;
  fechaExpiracion: Date;
  usado: boolean;
}

// Almacenamiento en memoria para desarrollo
const codigosDesarrollo: CodigoRecuperacion[] = [];

/**
 * Crea la tabla para almacenar códigos de recuperación si no existe
 */
export const crearTablaCodigosRecuperacion = async () => {
  console.log("Intentando crear tabla de códigos de recuperación...");
  
  if (EN_DESARROLLO) {
    console.log("MODO DESARROLLO: Simulando creación de tabla");
    return true;
  }
  
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS codigos_recuperacion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        codigo VARCHAR(10) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion TIMESTAMP,
        usado BOOLEAN DEFAULT 0,
        INDEX (email),
        INDEX (codigo),
        INDEX (usado)
      )
    `;
    
    await Conexion.execute(query);
    console.log("Tabla creada o ya existente");
    
    // Purgar códigos antiguos
    await purgarCodigosExpirados();
    
    return true;
  } catch (error) {
    console.error("ERROR al crear tabla codigos_recuperacion:", error);
    return false;
  }
};

/**
 * Elimina códigos expirados para mantener limpia la tabla
 */
export const purgarCodigosExpirados = async () => {
  console.log("Purgando códigos expirados...");
  
  if (EN_DESARROLLO) {
    console.log("MODO DESARROLLO: Purgando códigos expirados de memoria");
    const ahora = new Date();
    const cantidadAntes = codigosDesarrollo.length;
    
    // Filtrar los códigos que no están expirados
    const codigosFiltrados = codigosDesarrollo.filter(codigo => 
      codigo.fechaExpiracion > ahora && !codigo.usado
    );
    
    // Actualizar el array
    codigosDesarrollo.length = 0;
    codigosDesarrollo.push(...codigosFiltrados);
    
    console.log(`Purgados ${cantidadAntes - codigosFiltrados.length} códigos expirados`);
    return true;
  }
  
  try {
    const query = `
      DELETE FROM codigos_recuperacion
      WHERE fecha_expiracion < CURRENT_TIMESTAMP OR usado = 1
    `;
    
    const resultado = await Conexion.execute(query);
    console.log("Códigos expirados purgados correctamente");
    return true;
  } catch (error) {
    console.error("ERROR al purgar códigos expirados:", error);
    return false;
  }
};

/**
 * Busca un usuario por su correo electrónico
 * @param email Correo electrónico a buscar
 * @returns Objeto con información del usuario o null si no existe
 */
export const buscarUsuarioPorEmail = async (email: string) => {
  console.log(`Buscando usuario con email: ${email}`);
  
  if (EN_DESARROLLO) {
    console.log("MODO DESARROLLO: Simulando búsqueda de usuario");
    
    // Para desarrollo, aceptamos cualquier correo gmail como aprendiz
    // y cualquier correo sena como funcionario
    if (email.toLowerCase().includes("@gmail.com")) {
      console.log("Usuario encontrado (simulado): aprendiz");
      return { email, tipo: 'aprendiz' };
    } else if (email.toLowerCase().includes("@sena.edu.co")) {
      console.log("Usuario encontrado (simulado): funcionario");
      return { email, tipo: 'funcionario' };
    }
    
    // Si los correos no coinciden con los patrones anteriores, 
    // simulamos que no existe el usuario
    console.log("Usuario no encontrado (simulado)");
    return null;
  }
  
  try {
    // Buscar primero en la tabla de aprendices
    const queryAprendiz = `
      SELECT email_aprendiz as email, 'aprendiz' as tipo
      FROM aprendiz
      WHERE email_aprendiz = ?
    `;
    
    const aprendiz = await Conexion.query(queryAprendiz, [email]);
    
    if (aprendiz && aprendiz.length > 0) {
      console.log("Usuario encontrado: aprendiz");
      return aprendiz[0];
    }
    
    // Si no se encuentra, buscar en la tabla de funcionarios
    const queryFuncionario = `
      SELECT email as email, 'funcionario' as tipo
      FROM funcionario
      WHERE email = ?
    `;
    
    const funcionario = await Conexion.query(queryFuncionario, [email]);
    
    if (funcionario && funcionario.length > 0) {
      console.log("Usuario encontrado: funcionario");
      return funcionario[0];
    }
    
    console.log("Usuario no encontrado");
    return null;
  } catch (error) {
    console.error("ERROR al buscar usuario por email:", error);
    return null;
  }
};

/**
 * Guarda un código de recuperación asociado a un email
 */
export const guardarCodigoRecuperacion = async (email: string, codigo: string): Promise<boolean> => {
  console.log(`Guardando código ${codigo} para ${email}`);
  
  if (EN_DESARROLLO) {
    console.log("MODO DESARROLLO: Guardando código en memoria");
    
    // Establecer fecha de expiración (15 minutos)
    const fechaCreacion = new Date();
    const fechaExpiracion = new Date(fechaCreacion);
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);
    
    // Eliminar códigos previos para este email
    const index = codigosDesarrollo.findIndex(c => c.email === email && !c.usado);
    if (index >= 0) {
      console.log("Actualizando código existente en memoria");
      codigosDesarrollo.splice(index, 1);
    }
    
    // Guardar nuevo código
    codigosDesarrollo.push({
      email,
      codigo,
      fechaCreacion,
      fechaExpiracion,
      usado: false
    });
    
    console.log(`Código guardado en memoria: ${codigo} para ${email}`);
    console.log(`Expirará el: ${fechaExpiracion.toLocaleString()}`);
    return true;
  }
  
  try {
    // Verificar si existe un código previo para este email y actualizarlo
    const queryVerificar = `
      SELECT id FROM codigos_recuperacion 
      WHERE email = ? AND usado = 0
    `;
    
    const codigoExistente = await Conexion.query(queryVerificar, [email]);
    
    // Establecer fecha de expiración (15 minutos)
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);
    
    if (codigoExistente && codigoExistente.length > 0) {
      console.log("Actualizando código existente en base de datos");
      // Actualizar código existente
      const queryActualizar = `
        UPDATE codigos_recuperacion 
        SET codigo = ?, fecha_creacion = CURRENT_TIMESTAMP, fecha_expiracion = ?, usado = 0
        WHERE id = ?
      `;
      
      await Conexion.execute(queryActualizar, [
        codigo, 
        fechaExpiracion.toISOString().slice(0, 19).replace('T', ' '),
        codigoExistente[0].id
      ]);
    } else {
      console.log("Insertando nuevo código en base de datos");
      // Insertar nuevo código
      const queryInsertar = `
        INSERT INTO codigos_recuperacion (email, codigo, fecha_expiracion)
        VALUES (?, ?, ?)
      `;
      
      await Conexion.execute(queryInsertar, [
        email, 
        codigo, 
        fechaExpiracion.toISOString().slice(0, 19).replace('T', ' ')
      ]);
    }
    
    console.log("Código guardado correctamente en base de datos");
    return true;
  } catch (error) {
    console.error("ERROR al guardar código de recuperación:", error);
    return false;
  }
};

/**
 * Verifica si un código es válido para un email específico
 * @param email Correo electrónico del usuario
 * @param codigo Código de verificación a validar
 * @returns Booleano que indica si el código es válido
 */
export const verificarCodigoRecuperacion = async (email: string, codigo: string) => {
  console.log(`Verificando código: ${codigo} para email: ${email}`);
  
  if (EN_DESARROLLO) {
    console.log("MODO DESARROLLO: Verificando código en memoria");
    console.log(`Buscando: email=${email}, código=${codigo}`);
    const ahora = new Date();
    
    // Imprimir los códigos actuales para depuración
    console.log("Códigos en memoria:", JSON.stringify(codigosDesarrollo));
    
    // Buscar el código en el array
    const codigoEncontrado = codigosDesarrollo.find(c => 
      c.email === email && 
      c.codigo === codigo && 
      !c.usado && 
      c.fechaExpiracion > ahora
    );
    
    if (codigoEncontrado) {
      console.log("Código válido encontrado en memoria");
      return true;
    } else {
      // Proporcionar información más detallada sobre por qué falló
      console.log("Código no encontrado o inválido en memoria. Razones posibles:");
      const codigoMismoEmail = codigosDesarrollo.find(c => c.email === email);
      
      if (!codigoMismoEmail) {
        console.log("- No hay códigos para este email");
      } else {
        if (codigoMismoEmail.codigo !== codigo) {
          console.log(`- Código incorrecto. Esperado: ${codigoMismoEmail.codigo}, Recibido: ${codigo}`);
        }
        if (codigoMismoEmail.usado) {
          console.log("- El código ya fue utilizado");
        }
        if (codigoMismoEmail.fechaExpiracion <= ahora) {
          console.log(`- El código expiró. Fecha expiración: ${codigoMismoEmail.fechaExpiracion}, Ahora: ${ahora}`);
        }
      }
      
      return false;
    }
  }
  
  try {
    const query = `
      SELECT id 
      FROM codigos_recuperacion 
      WHERE email = ? AND codigo = ? AND usado = 0 AND fecha_expiracion > CURRENT_TIMESTAMP
    `;
    
    const resultado = await Conexion.query(query, [email, codigo]);
    
    const esValido = resultado && resultado.length > 0;
    console.log(`Resultado de verificación en base de datos: ${esValido ? "VÁLIDO" : "INVÁLIDO"}`);
    
    return esValido;
  } catch (error) {
    console.error("ERROR al verificar código de recuperación:", error);
    return false;
  }
};

/**
 * Marca un código como usado para evitar su reutilización
 * @param email Correo electrónico del usuario
 * @param codigo Código de verificación
 * @returns Booleano que indica si se marcó correctamente
 */
export const marcarCodigoComoUsado = async (email: string, codigo: string) => {
  console.log(`Marcando como usado código: ${codigo} para email: ${email}`);
  
  if (EN_DESARROLLO) {
    console.log("MODO DESARROLLO: Marcando código como usado en memoria");
    
    // Buscar el código en el array
    const index = codigosDesarrollo.findIndex(c => 
      c.email === email && 
      c.codigo === codigo && 
      !c.usado
    );
    
    if (index >= 0) {
      console.log("Código encontrado en memoria, marcando como usado");
      codigosDesarrollo[index].usado = true;
      return true;
    } else {
      console.log("Código no encontrado en memoria");
      return false;
    }
  }
  
  try {
    const query = `
      UPDATE codigos_recuperacion 
      SET usado = 1 
      WHERE email = ? AND codigo = ?
    `;
    
    await Conexion.execute(query, [email, codigo]);
    console.log("Código marcado como usado correctamente en base de datos");
    return true;
  } catch (error) {
    console.error("ERROR al marcar código como usado:", error);
    return false;
  }
};

/**
 * Actualiza la contraseña de un aprendiz
 * @param email Correo electrónico del aprendiz
 * @param nuevaPassword Nueva contraseña en texto plano
 * @returns Booleano que indica si la actualización fue exitosa
 */
export const actualizarPasswordAprendiz = async (email: string, nuevaPassword: string) => {
  console.log(`Actualizando contraseña para aprendiz con email: ${email}`);
  
  if (EN_DESARROLLO) {
    console.log("MODO DESARROLLO: Simulando actualización de contraseña para aprendiz");
    console.log("Nueva contraseña (hash simulado): " + "*".repeat(nuevaPassword.length));
    return true;
  }
  
  try {
    // Primero verificamos que el aprendiz existe
    const queryVerificar = `
      SELECT idaprendiz FROM aprendiz WHERE email_aprendiz = ?
    `;
    
    const aprendiz = await Conexion.query(queryVerificar, [email]);
    
    if (!aprendiz || aprendiz.length === 0) {
      console.log("Aprendiz no encontrado en base de datos");
      return false;
    }
    
    console.log("Aprendiz encontrado, generando hash de contraseña");
    // Generar hash de la nueva contraseña
    const hashedPassword = await hash(nuevaPassword);
    
    // Actualizar contraseña
    const queryActualizar = `
      UPDATE aprendiz 
      SET password_aprendiz = ? 
      WHERE email_aprendiz = ?
    `;
    
    await Conexion.execute(queryActualizar, [hashedPassword, email]);
    console.log("Contraseña actualizada correctamente para aprendiz");
    
    return true;
  } catch (error) {
    console.error("ERROR al actualizar contraseña de aprendiz:", error);
    return false;
  }
};

/**
 * Actualiza la contraseña de un funcionario
 * @param email Correo electrónico del funcionario
 * @param nuevaPassword Nueva contraseña en texto plano
 * @returns Booleano que indica si la actualización fue exitosa
 */
export const actualizarPasswordFuncionario = async (email: string, nuevaPassword: string) => {
  console.log(`Actualizando contraseña para funcionario con email: ${email}`);
  
  if (EN_DESARROLLO) {
    console.log("MODO DESARROLLO: Simulando actualización de contraseña para funcionario");
    console.log("Nueva contraseña (hash simulado): " + "*".repeat(nuevaPassword.length));
    return true;
  }
  
  try {
    // Verificar que el funcionario existe
    const queryVerificar = `
      SELECT idFuncionario FROM funcionario WHERE email = ?
    `;
    
    const funcionario = await Conexion.query(queryVerificar, [email]);
    
    if (!funcionario || funcionario.length === 0) {
      console.log("Funcionario no encontrado en base de datos");
      return false;
    }
    
    // Obtener el ID del funcionario
    const idFuncionario = funcionario[0].idFuncionario;
    console.log(`Funcionario encontrado con ID: ${idFuncionario}`);
    
    console.log("Generando hash de contraseña");
    // Generar hash de la nueva contraseña
    const hashedPassword = await hash(nuevaPassword);
    
    // Actualizar contraseña en la tabla funcionario_has_tipo_funcionario
    const queryActualizar = `
      UPDATE funcionario_has_tipo_funcionario 
      SET password = ? 
      WHERE funcionario_idfuncionario = ?
    `;
    
    await Conexion.execute(queryActualizar, [hashedPassword, idFuncionario]);
    console.log("Contraseña actualizada correctamente para funcionario");
    
    return true;
  } catch (error) {
    console.error("ERROR al actualizar contraseña de funcionario:", error);
    return false;
  }
};