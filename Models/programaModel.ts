import { Conexion } from "./conexion.ts";


export interface programa{

    idprograma?:number;
    codigo_programa:string;
    nombre_programa:string;
}

export const insertarProgramas = async (codigo_programa: string, nombre_programa: string) => {
  try {
    const result = await Conexion.query(
      "INSERT INTO programa (codigo_programa, nombre_programa) VALUES (?, ?)",
      [codigo_programa, nombre_programa]
    );

    console.log("Resultado de la inserción:", result);

    if (result?.affectedRows > 0) {
      return { success: true, id: result.insertId }; // <-- asegúrate de usar `insertId`
    } else {
      return { success: false, msg: "No se insertó ningún registro." };
    }
  } catch (error) {
    console.error("Error en insertarProgramas:", error?.message || error);
    return { success: false, msg: error.message };
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

