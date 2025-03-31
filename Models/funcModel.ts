import { Conexion } from "./conexion.ts";

export interface FuncionarioConRol {
  idFuncionario: number | null;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario: string | null;
  id_tipoDocumento: number;
  password: string;
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
        f.id_tipoDocumento,
        ft.password,
        tf.nombre AS rol
      FROM funcionario f
      INNER JOIN funcionario_has_tipo_funcionario ft 
        ON f.idFuncionario = ft.funcionario_id
      INNER JOIN tipo_funcionario tf 
        ON ft.tipo_funcionario_id = tf.id
      ${rol ? 'WHERE tf.nombre = ?' : ''}
    `;

    const params = rol ? [rol] : [];
    const result = await Conexion.query(query, params);
    
    return result as FuncionarioConRol[];
  } catch (error) {
    console.error("Error al listar Funcionarios", error);
    return [];
  }
};