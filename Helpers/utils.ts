// Helpers/utils.ts

import { hash as bcryptHash, genSalt, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

/**
 * Genera un hash de la contraseña proporcionada
 * @param password Contraseña en texto plano
 * @returns Contraseña hasheada
 */
export const hash = async (password: string): Promise<string> => {
  // Generar un salt con costo 10
  const salt = await genSalt(10);
  // Crear el hash
  return await bcryptHash(password, salt);
};

/**
 * Compara una contraseña en texto plano con una contraseña hasheada
 * @param password Contraseña en texto plano
 * @param hashedPassword Contraseña hasheada almacenada
 * @returns Booleano que indica si las contraseñas coinciden
 */
export const compareHash = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await compare(password, hashedPassword);
};

/**
 * Genera un código alfanumérico aleatorio de longitud especificada
 * @param length Longitud del código (por defecto 6)
 * @returns Código generado
 */
export const generarCodigo = (length: number = 6): string => {
  const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let codigo = '';
  
  for (let i = 0; i < length; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    codigo += caracteres.charAt(indiceAleatorio);
  }
  
  return codigo;
};

/**
 * Valida un formato de correo electrónico
 * @param email Correo electrónico a validar
 * @returns Booleano que indica si el formato del correo es válido
 */
export const validarEmail = (email: string): boolean => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
};

/**
 * Valida que una contraseña cumpla los requisitos mínimos de seguridad
 * @param password Contraseña a validar
 * @returns Objeto con estado de validación y mensaje
 */
export const validarPassword = (password: string): { valido: boolean, mensaje: string } => {
  // Mínimo 6 caracteres
  if (password.length < 6) {
    return {
      valido: false,
      mensaje: "La contraseña debe tener al menos 6 caracteres"
    };
  }
  
  // Verificar que contenga al menos un número
  if (!/\d/.test(password)) {
    return {
      valido: false,
      mensaje: "La contraseña debe contener al menos un número"
    };
  }
  
  // Verificar que contenga al menos una letra
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valido: false,
      mensaje: "La contraseña debe contener al menos una letra"
    };
  }
  
  return { valido: true, mensaje: "Contraseña válida" };
};