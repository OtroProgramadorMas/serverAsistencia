import { Conexion } from "./conexion.ts";

export interface Ficha_Asignacion_Estado {
  idFicha: number | null;
  codigo: string;
  fecha_inicio: string;
  programa_idPrograma: number | null;
  estado_ficha_idestado_ficha: number | null;

  // estado ficha
  idestado_ficha: number | null;
  estado_ficha: string;

  // ficha instructor
  funcionario_idfuncionario: number | null;
  ficha_idficha: number | null; 
}

export const listarFichasPorEstados = async (): Promise<Ficha_Asignacion_Estado[]> => {
  try {
    const rows = await Conexion.query(
      `SELECT f.*, e.*, fh.*
       FROM ficha f
       INNER JOIN estado_ficha e 
         ON e.idestado_ficha = f.estado_ficha_idestado_ficha
       INNER JOIN funcionario_has_ficha fh
         ON f.idficha = fh.ficha_idficha
       WHERE e.estado_ficha = 'Inducción' OR e.estado_ficha = 'Ejecución'`
    );

    return rows as Ficha_Asignacion_Estado[];
  } catch (error) {
    console.error("Error al listar fichas por estado:", error);
    return [];
  }
};
