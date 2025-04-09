import { Conexion } from "./conexion.ts";
import { z } from "../Dependencies/dependencias.ts";

interface EquiposData {
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

export const insertarDatosExcel = async (data: any[]) => {
  try {
    for (const row of data) {
      await Conexion.execute(
        `INSERT INTO aprendiz (
        documento_aprendiz,nombres_aprendiz,apellidos_aprendiz,telefono_aprendiz,email_aprendiz,password_aprendiz,ficha_idficha,estado_aprendiz_idestado_aprendiz,tipo_documento_idtipo_documento
        ) VALUES (
        ?,?,?,?,?,?, ?, ?, ?
        );`,
    [row["documento"], row["nombres"], row["apellidos"], row["telefono"],row["email"], row["password"], row["ficha"], row["estado"],row["tipodocumento"]]);
    }
    return { success: true, msg: "Datos insertados exitosamente" };
  } catch (error) {
    console.error("Error en insertarDatosExcel:", error);
    return { success: false, msg: "Error al insertar datos en la base de datos"};
  }
};


