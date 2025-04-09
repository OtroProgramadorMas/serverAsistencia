import { Conexion } from "./conexion.ts";

export interface Asistencia {
  idasistencia: number;
  fecha_asistencia: string;
  nombre_tipo_asistencia: string;
  idaprendiz: number;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  nombre_programa: string;
}

export const listarAsistenciasPorAprendiz = async (idAprendiz: number) => {
  try {
    const query = `
      SELECT 
        a.idasistencia, 
        a.fecha_asistencia, 
        ta.nombre_tipo_asistencia, 
        ap.idaprendiz, 
        ap.nombres_aprendiz, 
        ap.apellidos_aprendiz, 
        p.nombre_programa 
      FROM asistencia a 
      INNER JOIN tipo_asistencia ta ON a.tipo_asistencia_idtipo_asistencia = ta.idtipo_asistencia 
      INNER JOIN aprendiz ap ON a.aprendiz_idaprendiz = ap.idaprendiz 
      INNER JOIN ficha f ON ap.ficha_idficha = f.idficha 
      INNER JOIN programa p ON f.programa_idprograma = p.idprograma 
      WHERE ap.idaprendiz = ? 
      ORDER BY a.fecha_asistencia DESC
    `;
    
    const result = await Conexion.query(query, [idAprendiz]);
    return result as Asistencia[];
  } catch (error) {
    console.error("Error al listar Asistencias del Aprendiz", error);
    return [];
  }
};

// Crear nueva asistencia
export const crearAsistencia = async (
  idAprendiz: number,
  idTipoAsistencia: number,
  fecha: string = new Date().toISOString().split('T')[0]
) => {
  try {
    const query = `
      INSERT INTO asistencia (
        fecha_asistencia, 
        tipo_asistencia_idtipo_asistencia, 
        aprendiz_idaprendiz
      ) VALUES (?, ?, ?)
    `;
    //insert INTO programa (codigo_programa, nombre_programa) values (2824302,'Dibujo y modelado')
    const result = await Conexion.query(query, [fecha, idTipoAsistencia, idAprendiz]);
    return { success: true, id: result.lastInsertId };
  } catch (error) {
    console.error("Error al crear Asistencia", error);
    return { success: false, error };
  }
};

// Actualizar una asistencia existente
export const actualizarAsistencia = async (
  idAsistencia: number,
  idTipoAsistencia: number
) => {
  try {
    const query = `
      UPDATE asistencia 
      SET tipo_asistencia_idtipo_asistencia = ? 
      WHERE idasistencia = ?
    `;
    
    await Conexion.query(query, [idTipoAsistencia, idAsistencia]);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar Asistencia", error);
    return { success: false, error };
  }
};

// Eliminar una asistencia
export const eliminarAsistencia = async (idAsistencia: number) => {
  try {
    const query = `DELETE FROM asistencia WHERE idasistencia = ?`;
    
    await Conexion.query(query, [idAsistencia]);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar Asistencia", error);
    return { success: false, error };
  }
};

// Obtener tipos de asistencia para selectores
export const listarTiposAsistencia = async () => {
  try {
    const query = `SELECT idtipo_asistencia, nombre_tipo_asistencia FROM tipo_asistencia`;
    
    const result = await Conexion.query(query);
    return result;
  } catch (error) {
    console.error("Error al listar Tipos de Asistencia", error);
    return [];
  }
};