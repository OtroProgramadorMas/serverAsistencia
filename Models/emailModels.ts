import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
import { Conexion } from "./conexion.ts";

// Interfaz para los códigos de verificación
interface VerificationCode {
  email: string;
  code: string;
  expiry: Date;
  tipo: string;
}

// Almacén temporal de códigos (en producción usarías Redis o una tabla en DB)
const verificationCodes: VerificationCode[] = [];

// Almacén para tipos de usuario ya verificados
const verificacionesCompletadas: Record<string, string> = {};

export class PasswordRecoveryModel {
  // Verificar si existe un correo en la tabla de aprendices
  static async verificarAprendiz(email: string): Promise<boolean> {
    try {
      const result = await Conexion.query(
        "SELECT email_aprendiz FROM aprendiz WHERE email_aprendiz = ?",
        [email]
      );
      return result.length > 0;
    } catch (error) {
      console.error("Error al verificar aprendiz:", error);
      throw error;
    }
  }
    
  static async verificarFuncionario(email: string): Promise<boolean> {
    try {
      const result = await Conexion.query(
        "SELECT email FROM funcionario WHERE email = ?",
        [email]
      );
      return result.length > 0;
    } catch (error) {
      console.error("Error al verificar funcionario:", error);
      throw error;
    }
  }

  // Generar un código aleatorio de 6 dígitos
  static generarCodigo(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Guardar código de verificación
  static guardarCodigo(email: string, tipo: string): string {
    // Eliminar códigos existentes para este email
    const index = verificationCodes.findIndex(vc => vc.email === email);
    if (index !== -1) {
      verificationCodes.splice(index, 1);
    }
    
    // Generar nuevo código
    const code = this.generarCodigo();
        
    // Crear fecha de expiración (15 minutos)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    
    // Guardar en el array
    verificationCodes.push({
      email,
      code,
      expiry,
      tipo
    });
    
    return code;
  }

  // Verificar código
  static verificarCodigo(email: string, codigo: string): boolean {
    const now = new Date();
        
    // Buscar código
    const verificationData = verificationCodes.find(vc => 
      vc.email === email &&
      vc.code === codigo &&
      vc.expiry > now
    );
    
    // Si existe y no ha expirado
    if (verificationData) {
      // Guardar el tipo de usuario para futura referencia
      verificacionesCompletadas[email] = verificationData.tipo;
      
      // Eliminar el código después de verificarlo (uso único)
      const index = verificationCodes.findIndex(vc => vc.email === email);
      if (index !== -1) {
        verificationCodes.splice(index, 1);
      }
            
      return true;
    }
    
    return false;
  }

  // Obtener el tipo de usuario (aprendiz o funcionario)
  static getTipoUsuario(email: string): string | null {
    // Primero buscar en códigos activos
    const verificationData = verificationCodes.find(vc => vc.email === email);
    if (verificationData) {
      return verificationData.tipo;
    }
    
    // Si no se encuentra, buscar en verificaciones completadas
    return verificacionesCompletadas[email] || null;
  }

  // Actualizar contraseña de aprendiz
  static async actualizarPasswordAprendiz(email: string, nuevaPassword: string): Promise<boolean> {
    try {
      const result = await Conexion.query(
        "UPDATE aprendiz SET password_aprendiz = ? WHERE email_aprendiz = ?",
        [nuevaPassword, email]
      );
      
      // Limpiar la información de verificación después de una actualización exitosa
      if (result.affectedRows > 0) {
        delete verificacionesCompletadas[email];
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al actualizar contraseña de aprendiz:", error);
      throw error;
    }
  }

  // Actualizar contraseña de funcionario
  static async actualizarPasswordFuncionario(email: string, nuevaPassword: string): Promise<boolean> {
    try {
      const result = await Conexion.query(
        "UPDATE funcionario SET password = ? WHERE email = ?",
        [nuevaPassword, email]
      );
      
      // Limpiar la información de verificación después de una actualización exitosa
      if (result.affectedRows > 0) {
        delete verificacionesCompletadas[email];
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al actualizar contraseña de funcionario:", error);
      throw error;
    }
  }
}