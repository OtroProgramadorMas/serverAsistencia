import { Conexion } from "./conexion.ts";


export interface Funcionario {
  idFuncionario: number | null;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario: string | null;
  id_tipoDocumento: number;
}

export interface FuncionarioConRol {
  idFuncionario: number | null;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario: string | null;
  id_tipoDocumento: number;
  password: string | null;
  rol: string; // Tipo de funcionario (administrador, docente, etc.)
}

export const listarFuncionario_Roles = async (rol?: string) => {
  try {
    const query = `
      SELECT 
        f.idFuncionario,
        f.documento,
        f.nombres,
        f.apellidos,
        f.email,
        f.telefono,
        f.url_imgFuncionario,
        f.tipo_documento_idtipo_documento,
        ft.password,
        tf.tipo_funcionario AS rol
      FROM funcionario f
      INNER JOIN funcionario_has_tipo_funcionario ft 
        ON f.idFuncionario = ft.funcionario_idfuncionario
      INNER JOIN tipo_funcionario tf 
        ON ft.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
      ${rol ? 'WHERE tf.tipo_funcionario = ?' : ''}
    `;

    const params = rol ? [rol] : [];
    const result = await Conexion.query(query, params);
    
    return result as FuncionarioConRol[];
  } catch (error) {
    console.error("Error al listar Funcionarios", error);
    return [];
  }
};

// CRUD

// Insertar un nuevo funcionario
export const insertarFuncionario = async (funcionario: Funcionario) => {
  try {
    const query = `
      INSERT INTO funcionario (
        documento, nombres, apellidos, email, telefono, url_imgFuncionario, tipo_documento_idtipo_documento
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      funcionario.documento,
      funcionario.nombres,
      funcionario.apellidos,
      funcionario.email,
      funcionario.telefono,
      funcionario.url_imgFuncionario,
      funcionario.id_tipoDocumento
    ];

    const result = await Conexion.query(query, params);
    return result;
  } catch (error) {
    console.error("Error al insertar funcionario:", error);
    return null;
  }
};

// Insertar en la tabla de rompimiento funcionario_has_tipo_funcionario
export const insertarFuncionarioHasTipoFuncionario = async (
  funcionario_idfuncionario: number,
  tipo_funcionario_idtipo_funcionario: number,
  password: string
) => {
  try {
    const query = `
      INSERT INTO funcionario_has_tipo_funcionario (
        funcionario_idfuncionario, tipo_funcionario_idtipo_funcionario, password
      ) VALUES (?, ?, ?)
    `;

    const params = [funcionario_idfuncionario, tipo_funcionario_idtipo_funcionario, password];
    const result = await Conexion.query(query, params);
    return result;
  } catch (error) {
    console.error("Error al insertar relación funcionario-rol:", error);
    return null;
  }
};





