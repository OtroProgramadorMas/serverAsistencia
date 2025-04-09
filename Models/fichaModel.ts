import { Conexion } from "./conexion.ts";

export interface Ficha {
  idficha?: number;
  codigo: string;
  fecha_inicio: string;
  programa_idprograma: number;
  estado_ficha_idestado_ficha: number;
}

export interface Ficha_Asignacion_Estado {
  idficha?: number;
  codigo: string;
  fecha_inicio: string;
  programa_idprograma: number;
  estado_ficha_idestado_ficha: number;

  // estado ficha
  idestado_ficha?: number;
  estado_ficha?: string;

  // ficha instructor
  funcionario_idfuncionario?: number;
  ficha_idficha?: number; 
  
  // programa info (opcional, para joins)
  codigo_programa?: string;
  nombre_programa?: string;
}

/*

Read 
- fichas activas
- fichas por programa
- ficha por id
- estados fichas 

*/

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

export const listarFichasPorPrograma = async (programa_id: number): Promise<Ficha_Asignacion_Estado[]> => {
  try {
    const rows = await Conexion.query(
      `SELECT f.*, e.*, p.codigo_programa, p.nombre_programa
       FROM ficha f
       INNER JOIN estado_ficha e ON e.idestado_ficha = f.estado_ficha_idestado_ficha
       INNER JOIN programa p ON p.idprograma = f.programa_idprograma
       LEFT JOIN funcionario_has_ficha fh ON f.idficha = fh.ficha_idficha
       WHERE f.programa_idprograma = ?`,
      [programa_id]
    );

    return rows as Ficha_Asignacion_Estado[];
  } catch (error) {
    console.error("Error al listar fichas por programa:", error);
    throw error;
  }
};

export const buscarFichaPorId = async (idficha: number): Promise<Ficha_Asignacion_Estado | null> => {
  try {
    const rows = await Conexion.query(
      `SELECT f.*, e.*, p.codigo_programa, p.nombre_programa
       FROM ficha f
       INNER JOIN estado_ficha e ON e.idestado_ficha = f.estado_ficha_idestado_ficha
       INNER JOIN programa p ON p.idprograma = f.programa_idprograma
       LEFT JOIN funcionario_has_ficha fh ON f.idficha = fh.ficha_idficha
       WHERE f.idficha = ?`,
      [idficha]
    );

    if (rows && rows.length > 0) {
      return rows[0] as Ficha_Asignacion_Estado;
    }
    return null;
  } catch (error) {
    console.error("Error al buscar ficha por ID:", error);
    throw error;
  }
};

export const listarEstadosFicha = async () => {
  try {
    const rows = await Conexion.query(
      `SELECT * FROM estado_ficha`
    );
    return rows;
  } catch (error) {
    console.error("Error al listar estados de ficha:", error);
    throw error;
  }
};

/* 

Create Update y Delete

*/

export const crearFicha = async (ficha: Ficha) => {
  try {
    const result = await Conexion.query(
      `INSERT INTO ficha (codigo, fecha_inicio, programa_idprograma, estado_ficha_idestado_ficha)
       VALUES (?, ?, ?, ?)`,
      [ficha.codigo, ficha.fecha_inicio, ficha.programa_idprograma, ficha.estado_ficha_idestado_ficha]
    );

    if (result?.affectedRows > 0) {
      return { success: true, id: result.insertId };
    } else {
      return { success: false, msg: "No se pudo crear la ficha" };
    }
  } catch (error) {
    console.error("Error al crear ficha:", error);
    return { success: false, msg: error };
  }
};


export const actualizarFicha = async (idficha: number, ficha: Partial<Ficha>) => {
  try {
    // Construimos la consulta dinámicamente según los campos que se quieran actualizar
    const updateFields = [];
    const values = [];

    if (ficha.codigo) {
      updateFields.push("codigo = ?");
      values.push(ficha.codigo);
    }

    if (ficha.fecha_inicio) {
      updateFields.push("fecha_inicio = ?");
      values.push(ficha.fecha_inicio);
    }

    if (ficha.programa_idprograma) {
      updateFields.push("programa_idprograma = ?");
      values.push(ficha.programa_idprograma);
    }

    if (ficha.estado_ficha_idestado_ficha) {
      updateFields.push("estado_ficha_idestado_ficha = ?");
      values.push(ficha.estado_ficha_idestado_ficha);
    }

    if (updateFields.length === 0) {
      return { success: false, msg: "No se proporcionaron campos para actualizar" };
    }

    // Añadimos el ID al final para la cláusula WHERE
    values.push(idficha);

    const query = `UPDATE ficha SET ${updateFields.join(", ")} WHERE idficha = ?`;
    const result = await Conexion.query(query, values);

    if (result?.affectedRows > 0) {
      return { success: true };
    } else {
      return { success: false, msg: "No se actualizó ningún registro o la ficha no existe" };
    }
  } catch (error) {
    console.error("Error al actualizar ficha:", error);
    return { success: false, msg: error };
  }
};

// Nueva función para verificar si una ficha tiene aprendices asociados
export const verificarAprendicesEnFicha = async (idficha: number) => {
  try {
    // Asumiendo que existe una tabla "aprendiz" con una columna "ficha_idficha" que relaciona con ficha
    const query = `
      SELECT COUNT(*) as count
      FROM aprendiz
      WHERE ficha_idficha = ?
    `;
    
    const result = await Conexion.query(query, [idficha]);
    
    // Si el conteo es mayor a 0, significa que la ficha tiene aprendices asociados
    return result[0].count > 0;
  } catch (error) {
    console.error("Error al verificar aprendices en ficha:", error);
    throw error;
  }
};

export const eliminarFicha = async (idficha: number) => {
  try {
    // Primero verificamos si la ficha tiene aprendices asociados
    const fichaConAprendices = await verificarAprendicesEnFicha(idficha);
    
    if (fichaConAprendices) {
      return { 
        success: false, 
        msg: "No se puede eliminar la ficha porque tiene aprendices asociados" 
      };
    }
    
    // Si no tiene aprendices, eliminamos las relaciones en la tabla funcionario_has_ficha
    await Conexion.query(
      `DELETE FROM funcionario_has_ficha WHERE ficha_idficha = ?`,
      [idficha]
    );

    // Luego eliminamos la ficha
    const result = await Conexion.query(
      `DELETE FROM ficha WHERE idficha = ?`,
      [idficha]
    );

    if (result?.affectedRows > 0) {
      return { success: true };
    } else {
      return { success: false, msg: "No se eliminó ningún registro o la ficha no existe" };
    }
  } catch (error) {
    console.error("Error al eliminar ficha:", error);
    return { success: false, msg: error };
  }
};

/*

Metodos de Asignacion de instructor

*/

export const asignarInstructorAFicha = async (ficha_id: number, funcionario_id: number) => {
  try {
    // Primero verificamos si ya existe una asignación
    const existente = await Conexion.query(
      `SELECT * FROM funcionario_has_ficha WHERE ficha_idficha = ? AND funcionario_idfuncionario = ?`,
      [ficha_id, funcionario_id]
    );

    if (existente && existente.length > 0) {
      return { success: true, msg: "El instructor ya está asignado a esta ficha" };
    }

    const result = await Conexion.query(
      `INSERT INTO funcionario_has_ficha (ficha_idficha, funcionario_idfuncionario)
       VALUES (?, ?)`,
      [ficha_id, funcionario_id]
    );

    if (result?.affectedRows > 0) {
      return { success: true };
    } else {
      return { success: false, msg: "No se pudo asignar el instructor a la ficha" };
    }
  } catch (error) {
    console.error("Error al asignar instructor a ficha:", error);
    return { success: false, msg: error};
  }
};

export const removerInstructorDeFicha = async (ficha_id: number, funcionario_id: number) => {
  try {
    const result = await Conexion.query(
      `DELETE FROM funcionario_has_ficha WHERE ficha_idficha = ? AND funcionario_idfuncionario = ?`,
      [ficha_id, funcionario_id]
    );

    if (result?.affectedRows > 0) {
      return { success: true };
    } else {
      return { success: false, msg: "No se encontró la asignación o no se pudo eliminar" };
    }
  } catch (error) {
    console.error("Error al remover instructor de ficha:", error);
    return { success: false, msg: error};
  }
};