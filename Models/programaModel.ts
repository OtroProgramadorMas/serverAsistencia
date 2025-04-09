import { Conexion } from "./conexion.ts";


export interface programa{

    idprograma?:number;
    codigo_programa:string;
    nombre_programa:string;
}

export const insertarProgramas = async (
    codigo_programa: number,
    nombre_programa: string,
  ) => {
    try {
      const query = `
        INSERT INTO programa (
          codigo_programa, nombre_programa
        ) VALUES (?, ?)
      `;
  
      const result = await Conexion.query(query, [codigo_programa, nombre_programa]);
      return { success: true, id: result.lastInsertId };
    } catch (error) {
      console.error("Error al crear programa", error);
      return { success: false, error };
    }
  };
  


      export const listarProgramas = async () => {
        try {
          const query =`
          SELECT 
          idprograma, codigo_programa, nombre_programa 
          FROM programa
          `;
          const result = await Conexion.query(query);
          return { success: true, data: result };
        } catch (error) {
          console.error("Error al obtener programas", error);
          return { success: false, error };
        }
};

