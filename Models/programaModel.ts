import { Conexion } from "./conexion.ts";

export interface Programa {
  idprograma?: number;
  codigo_programa: string;
  nombre_programa: string;
}

export const insertarProgramas = async (codigo_programa: string, nombre_programa: string) => {
  try {
    const result = await Conexion.query(
      "INSERT INTO programa (codigo_programa, nombre_programa) VALUES (?, ?)",
      [codigo_programa, nombre_programa]
    );

    console.log("Resultado de la inserción:", result);

    if (result?.affectedRows > 0) {
      return { success: true, id: result.insertId };
    } else {
      return { success: false, msg: "No se insertó ningún registro." };
    }
  } catch (error) {
    console.error("Error en insertarProgramas:", error);
    return { success: false, msg: error};
  }
};

export const listarProgramas = async () => {
  try {
    const query = `
      SELECT 
        idprograma, codigo_programa, nombre_programa 
      FROM programa
    `;
    const result = await Conexion.query(query);
    return result;
  } catch (error) {
    console.error("Error al obtener programas:", error);
    throw error;
  }
};

export const buscarProgramaPorId = async (idprograma: number) => {
  try {
    const query = `
      SELECT 
        idprograma, codigo_programa, nombre_programa 
      FROM programa
      WHERE idprograma = ?
    `;
    const result = await Conexion.query(query, [idprograma]);
    
    if (result && result.length > 0) {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error("Error al buscar programa por ID:", error);
    throw error;
  }
};

export const actualizarPrograma = async (idprograma: number, codigo_programa: string, nombre_programa: string) => {
  try {
    const query = `
      UPDATE programa 
      SET codigo_programa = ?, nombre_programa = ?
      WHERE idprograma = ?
    `;
    
    const result = await Conexion.query(query, [codigo_programa, nombre_programa, idprograma]);
    
    if (result?.affectedRows > 0) {
      return { success: true };
    } else {
      return { success: false, msg: "No se actualizó ningún registro o el programa no existe." };
    }
  } catch (error) {
    console.error("Error al actualizar programa:", error);
    return { success: false, msg: error };
  }
};

export const verificarProgramaEnFicha = async (idprograma: number) => {
  try {
    // Asumiendo que existe una tabla "ficha" con una columna "programa_id" que relaciona con programa
    const query = `
      SELECT COUNT(*) as count
      FROM ficha
      WHERE programa_idprograma = ?
    `;
    
    const result = await Conexion.query(query, [idprograma]);
    
    // Si el conteo es mayor a 0, significa que el programa está en uso
    return result[0].count > 0;
  } catch (error) {
    console.error("Error al verificar programa en ficha:", error);
    throw error;
  }
};

export const eliminarPrograma = async (idprograma: number) => {
  try {
    // Primero verificamos si el programa está en uso
    const programaEnUso = await verificarProgramaEnFicha(idprograma);
    
    if (programaEnUso) {
      return { 
        success: false, 
        msg: "No se puede eliminar el programa porque está asociado a una o más fichas." 
      };
    }
    
    const query = `
      DELETE FROM programa
      WHERE idprograma = ?
    `;
    
    const result = await Conexion.query(query, [idprograma]);
    
    if (result?.affectedRows > 0) {
      return { success: true };
    } else {
      return { success: false, msg: "No se eliminó ningún registro o el programa no existe." };
    }
  } catch (error) {
    console.error("Error al eliminar programa:", error);
    return { success: false, msg: error };
  }
};