import { Conexion } from "./conexion.ts";

export interface Aprendiz {
  idaprendiz: number;
  documento_aprendiz: string;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  telefono_aprendiz: number;
  email_aprendiz: string;
  password_aprendiz: string;
  estado_aprendiz: string;
  idficha: number;
  codigo_ficha: number;
  fecha_inicio: Date;
  idestado_ficha: number;
  idprograma: number;
  codigo_programa: number;
  nombre_programa: string;
}

export const listarAprendices = async () => {
  try {
    const query = "SELECT ap.idaprendiz, ap.documento_aprendiz, ap.nombres_aprendiz, ap.apellidos_aprendiz, ap.telefono_aprendiz, ap.email_aprendiz, ap.password_aprendiz, ea.idestado_aprendiz, ea.estado_aprendiz, f.idficha, f.codigo_ficha, f.fecha_inicio, ef.idestado_ficha, ef.estado_ficha, p.idprograma, p.codigo_programa, p.nombre_programa FROM edu_sena.aprendiz ap INNER JOIN edu_sena.estado_aprendiz ea ON ap.estado_aprendiz_idestado_aprendiz = ea.idestado_aprendiz INNER JOIN edu_sena.ficha f ON ap.ficha_idficha = f.idficha INNER JOIN edu_sena.estado_ficha ef ON f.estado_ficha_idestado_ficha = ef.idestado_ficha INNER JOIN edu_sena.programa p ON f.programa_idprograma = p.idprograma";
    
    const result = await Conexion.query(query);
    return result as Aprendiz[];
  } catch (error) {
    console.error("Error al listar Aprendices", error);
    return [];
  }
};

export const buscarAprendizPorId = async (id: number) => {
  try {
    const query = "SELECT ap.idaprendiz, ap.documento_aprendiz, ap.nombres_aprendiz, ap.apellidos_aprendiz, ap.telefono_aprendiz, ap.email_aprendiz, ap.password_aprendiz, ea.idestado_aprendiz, ea.estado_aprendiz, f.idficha, f.codigo_ficha, f.fecha_inicio, ef.idestado_ficha, ef.estado_ficha, p.idprograma, p.codigo_programa, p.nombre_programa FROM edu_sena.aprendiz ap INNER JOIN edu_sena.estado_aprendiz ea ON ap.estado_aprendiz_idestado_aprendiz = ea.idestado_aprendiz INNER JOIN edu_sena.ficha f ON ap.ficha_idficha = f.idficha INNER JOIN edu_sena.estado_ficha ef ON f.estado_ficha_idestado_ficha = ef.idestado_ficha INNER JOIN edu_sena.programa p ON f.programa_idprograma = p.idprograma WHERE ap.idaprendiz = ?";
    
    const result = await Conexion.query(query, [id]);
    return result.length > 0 ? result[0] as Aprendiz : null;
  } catch (error) {
    console.error("Error al buscar Aprendiz por ID", error);
    return null;
  }
};