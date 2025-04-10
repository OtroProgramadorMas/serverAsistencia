import { Conexion } from "./conexion.ts";
import { buscarFichaPorId } from "./fichaModel.ts";

export interface Aprendiz {
  idaprendiz: number | null;
  documento_aprendiz: string;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  telefono_aprendiz: string;
  email_aprendiz: string;
  password_aprendiz: string;
  ficha_idficha: number;
  estado_aprendiz_idestado_aprendiz: number;
  tipo_documento_idtipo_documento: number;
}

export interface AprendizActivo {
  idaprendiz: number | null;
  documento_aprendiz: string;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  // Relaciones
  ficha_idficha: number;
  estado_aprendiz: string;
}

interface AprendizResponse {
  success: boolean;
  msg?: string;
  aprendices?: Aprendiz[];
  aprendiz?: Aprendiz;
  idaprendiz?: number;
  error?: any;
}

export const listarAprendices = async (): Promise<AprendizResponse> => {
  try {
    const result = await Conexion.query("SELECT * FROM aprendiz");
    return { success: true, aprendices: result as Aprendiz[] };
  } catch (error) {
    console.error("Error al listar aprendices:", error);
    return { success: false, msg: "Error al listar aprendices", error };
  }
};

// Keeping the original function but using the new response format
export const listarAprendiz = async (): Promise<AprendizResponse> => {
  try {
    const result = await Conexion.query("SELECT * FROM aprendiz");
    return { success: true, aprendices: result as Aprendiz[] };
  } catch (error) {
    console.error("Error al listar Aprendices", error);
    return { success: false, msg: "Error al listar aprendices", error };
  }
};

export const listarAprendizActivos = async (): Promise<AprendizResponse> => {
  try {
    const result = await Conexion.query(
      `SELECT
            a.idaprendiz,
            a.documento_aprendiz,
            a.nombres_aprendiz,
            a.apellidos_aprendiz,
            a.ficha_idficha,
            e.estado_aprendiz
            FROM aprendiz a
            INNER JOIN estado_aprendiz e 
              ON e.idestado_aprendiz = a.estado_aprendiz_idestado_aprendiz
            INNER JOIN ficha f
              ON f.idficha = a.ficha_idficha
            WHERE e.estado_aprendiz = 'En Formación'`,
    );
    return { success: true, aprendices: result as AprendizActivo[] };
  } catch (error) {
    console.error("Error al listar Aprendices Activos", error);
    return { success: false, msg: "Error al listar aprendices activos", error };
  }
};

export const obtenerAprendizPorId = async (id: number): Promise<AprendizResponse> => {
  try {
    const result = await Conexion.query("SELECT * FROM aprendiz WHERE idaprendiz = ?", [id]);
    
    if (Array.isArray(result) && result.length > 0) {
      return { success: true, aprendiz: result[0] as Aprendiz };
    } else {
      return { success: false, msg: "Aprendiz no encontrado" };
    }
  } catch (error) {
    console.error(`Error al obtener aprendiz con ID ${id}:`, error);
    return { success: false, msg: "Error al obtener el aprendiz", error };
  }
};

export const obtenerAprendicesPorFicha = async (fichaId: number): Promise<AprendizResponse> => {
  try {
    // Primero verificamos que la ficha exista
    const ficha = await buscarFichaPorId(fichaId);
    if (!ficha) {
      return { success: false, msg: "La ficha especificada no existe" };
    }
    
    const result = await Conexion.query(
      "SELECT * FROM aprendiz WHERE ficha_idficha = ?", 
      [fichaId]
    );
    
    return { success: true, aprendices: result as Aprendiz[] };
  } catch (error) {
    console.error(`Error al obtener aprendices de la ficha ${fichaId}:`, error);
    return { success: false, msg: "Error al obtener aprendices por ficha", error };
  }
};

export const listarEstadosAprendiz = async () => {
  try {
    const rows = await Conexion.query(
      `SELECT * FROM estado_aprendiz`
    );
    return rows;
  } catch (error) {
    console.error("Error al listar estados de ficha:", error);
    throw error;
  }
};

export const crearAprendiz = async (aprendiz: Omit<Aprendiz, 'idaprendiz'>): Promise<AprendizResponse> => {
  try {
    // Verificamos que la ficha exista antes de crear el aprendiz
    const ficha = await buscarFichaPorId(aprendiz.ficha_idficha);
    if (!ficha) {
      return { success: false, msg: "La ficha especificada no existe" };
    }
    
    // Aseguramos que el estado sea 2 por defecto
    const estadoAprendiz = 2;  // Estado predefinido como 2
    
    const result = await Conexion.query(
      `INSERT INTO aprendiz (
        documento_aprendiz, 
        nombres_aprendiz, 
        apellidos_aprendiz, 
        telefono_aprendiz, 
        email_aprendiz, 
        password_aprendiz, 
        ficha_idficha, 
        estado_aprendiz_idestado_aprendiz, 
        tipo_documento_idtipo_documento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        aprendiz.documento_aprendiz,
        aprendiz.nombres_aprendiz,
        aprendiz.apellidos_aprendiz,
        aprendiz.telefono_aprendiz,
        aprendiz.email_aprendiz,
        aprendiz.password_aprendiz,
        aprendiz.ficha_idficha,
        estadoAprendiz,  // Usamos 2 en lugar del valor proporcionado
        aprendiz.tipo_documento_idtipo_documento
      ]
    );

    if (result && result.insertId) {
      return { 
        success: true, 
        msg: "Aprendiz creado exitosamente", 
        idaprendiz: result.insertId 
      };
    } else {
      return { success: false, msg: "No se pudo crear el aprendiz" };
    }
  } catch (error) {
    console.error("Error al crear aprendiz:", error);
    return { success: false, msg: "Error al crear el aprendiz", error };
  }
};

export const actualizarAprendiz = async (id: number, aprendiz: Partial<Aprendiz>): Promise<AprendizResponse> => {
  try {
    // Si se está actualizando la ficha, verificamos que exista
    if (aprendiz.ficha_idficha !== undefined) {
      const ficha = await buscarFichaPorId(aprendiz.ficha_idficha);
      if (!ficha) {
        return { success: false, msg: "La ficha especificada no existe" };
      }
    }
    
    // Verificamos que el aprendiz exista antes de actualizarlo
    const aprendizExistente = await obtenerAprendizPorId(id);
    if (!aprendizExistente.success) {
      return { success: false, msg: "El aprendiz no existe" };
    }
    
    // Construimos la consulta dinámicamente basada en los campos proporcionados
    let query = "UPDATE aprendiz SET ";
    const values: any[] = [];
    const fields: string[] = [];

    // Solo incluimos los campos que están presentes en el objeto
    if (aprendiz.documento_aprendiz !== undefined) {
      fields.push("documento_aprendiz = ?");
      values.push(aprendiz.documento_aprendiz);
    }
    if (aprendiz.nombres_aprendiz !== undefined) {
      fields.push("nombres_aprendiz = ?");
      values.push(aprendiz.nombres_aprendiz);
    }
    if (aprendiz.apellidos_aprendiz !== undefined) {
      fields.push("apellidos_aprendiz = ?");
      values.push(aprendiz.apellidos_aprendiz);
    }
    if (aprendiz.telefono_aprendiz !== undefined) {
      fields.push("telefono_aprendiz = ?");
      values.push(aprendiz.telefono_aprendiz);
    }
    if (aprendiz.email_aprendiz !== undefined) {
      fields.push("email_aprendiz = ?");
      values.push(aprendiz.email_aprendiz);
    }
    if (aprendiz.password_aprendiz !== undefined) {
      fields.push("password_aprendiz = ?");
      values.push(aprendiz.password_aprendiz);
    }
    if (aprendiz.ficha_idficha !== undefined) {
      fields.push("ficha_idficha = ?");
      values.push(aprendiz.ficha_idficha);
    }
    if (aprendiz.estado_aprendiz_idestado_aprendiz !== undefined) {
      fields.push("estado_aprendiz_idestado_aprendiz = ?");
      values.push(aprendiz.estado_aprendiz_idestado_aprendiz);
    }
    if (aprendiz.tipo_documento_idtipo_documento !== undefined) {
      fields.push("tipo_documento_idtipo_documento = ?");
      values.push(aprendiz.tipo_documento_idtipo_documento);
    }

    // Si no hay campos para actualizar, retornamos
    if (fields.length === 0) {
      return { success: false, msg: "No se proporcionaron campos para actualizar" };
    }

    // Completamos la consulta
    query += fields.join(", ");
    query += " WHERE idaprendiz = ?";
    values.push(id);

    const result = await Conexion.query(query, values);
    
    if (result && result.affectedRows > 0) {
      return { success: true, msg: "Aprendiz actualizado exitosamente" };
    } else {
      return { success: false, msg: "No se pudo actualizar el aprendiz o no existe" };
    }
  } catch (error) {
    console.error(`Error al actualizar aprendiz con ID ${id}:`, error);
    return { success: false, msg: "Error al actualizar el aprendiz", error };
  }
};

export const eliminarAprendiz = async (id: number): Promise<AprendizResponse> => {
  try {
    // Verificamos que el aprendiz exista antes de eliminarlo
    const aprendizExistente = await obtenerAprendizPorId(id);
    if (!aprendizExistente.success) {
      return { success: false, msg: "El aprendiz no existe" };
    }
    
    const result = await Conexion.query("DELETE FROM aprendiz WHERE idaprendiz = ?", [id]);
    
    if (result && result.affectedRows > 0) {
      return { success: true, msg: "Aprendiz eliminado exitosamente" };
    } else {
      return { success: false, msg: "No se pudo eliminar el aprendiz o no existe" };
    }
  } catch (error) {
    console.error(`Error al eliminar aprendiz con ID ${id}:`, error);
    return { success: false, msg: "Error al eliminar el aprendiz", error };
  }
};

export const buscarAprendicesPorDocumento = async (documento: string): Promise<AprendizResponse> => {
  try {
    const result = await Conexion.query(
      "SELECT * FROM aprendiz WHERE documento_aprendiz = ?",
      [documento]
    );
    
    return { success: true, aprendices: result as Aprendiz[] };
  } catch (error) {
    console.error(`Error al buscar aprendiz con documento '${documento}':`, error);
    return { success: false, msg: "Error al buscar aprendiz por documento", error };
  }
};