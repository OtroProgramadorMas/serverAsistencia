import { Conexion } from "./conexion.ts";

export interface aprendiz {
  idaprendiz: number | null;
  documento_aprendiz: string;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  telefono_aprendiz: string;
  email_aprendiz: string;
  password_aprendiz: string;
  idFicha: number;
  id_estadoAprendiz: number;
  id_TipoDocumento: number;
}

export interface aprendiz_Activo {
  idaprendiz: number | null;
  documento_aprendiz: string;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  // Relaciones
  ficha_idFicha: number;
  estado_aprendiz: string;
}

export const listarAprendiz = async () => {
  try {
    const result = await Conexion.query("SELECT * FROM aprendiz");
    return result as aprendiz[];
  } catch (error) {
    console.error("Error al listar Aprendices", error);
    return [];
  }
};

export const listarAprendiz_Activos = async () => {
  try {
    const result = await Conexion.query(
      `SELECT
            a.idaprendiz,
            a.documento_aprendiz,
            a.nombres_aprendiz,
            a.apellidos_aprendiz,
            a.ficha_idFicha,
            e.estado_aprendiz
            FROM aprendiz a
            INNER JOIN estado_aprendiz e 
              ON e.idestado_aprendiz = a.estado_aprendiz_idestado_aprendiz
            INNER JOIN ficha f
              ON f.idficha = a.ficha_idficha
            WHERE e.estado_aprendiz = 'En Formación'`,
    );
    return result as aprendiz_Activo[];
  } catch (error) {
    console.error("Error al listar Aprendices", error);
    return [];
  }
};
