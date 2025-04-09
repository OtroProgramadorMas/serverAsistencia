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

export const listarAprendiz = async ()=> {
    try {
        const result = await Conexion.query("SELECT * FROM aprendiz");
        return result as aprendiz[];
    } catch (error) {
        console.error("Error al listar Aprendices", error);
        return[];
    }
}

export const insertarDatosExcel = async (data: any[]) => {
    try {
      for (const row of data) {
        await Conexion.execute(
          
      []);
      }
      return { success: true, msg: "Datos insertados exitosamente" };
    } catch (error) {
      console.error("Error en insertarDatosExcel:", error);
      return { success: false, msg: "Error al insertar datos en la base de datos"};
    }
  };
  
  export const insertarProgramas = async (documento_aprendiz: string,nombres_aprendiz: string,apellidos_aprendiz: string,telefono_aprendiz: string,email_aprendiz: string,
    password_aprendiz: string,idFicha: number,id_estadoAprendiz: number,id_TipoDocumento: number) => {
    try {
      const result = await Conexion.query(
        `INSERT INTO aprendiz (
          documento_aprendiz,nombres_aprendiz,apellidos_aprendiz,telefono_aprendiz,email_aprendiz,password_aprendiz,ficha_idficha,estado_aprendiz_idestado_aprendiz,tipo_documento_idtipo_documento
          ) VALUES (
          ?,?,?,?,?,?, ?, ?, ?
          );`,
        [documento_aprendiz,nombres_aprendiz,apellidos_aprendiz,telefono_aprendiz,email_aprendiz,password_aprendiz,idFicha,id_estadoAprendiz,id_TipoDocumento]
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