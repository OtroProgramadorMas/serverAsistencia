import { Conexion } from "../Models/conexion.ts";

// Interfaz opcional para validación fuerte
interface AprendizRow {
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  tipo_documento_id: number;
  documento_aprendiz: string;
  telefono_aprendiz: string;
  email_aprendiz: string;
  id_estadoAprendiz: number;
  id_TipoDocumento: number;
}

// Validación sencilla por fila (puedes mejorar con zod si querés)
function validarAprendiz(row: any): boolean {
  return (
    typeof row.nombres_aprendiz === "string" &&
    typeof row.apellidos_aprendiz === "string" &&
    typeof row.tipo_documento_id === "number" &&
    typeof row.documento_aprendiz === "string" &&
    typeof row.telefono_aprendiz === "string" &&
    typeof row.email_aprendiz === "string" &&
    typeof row.id_estadoAprendiz === "number" &&
    typeof row.id_TipoDocumento === "number"
  );
}


//Listar aprendiz por ficha

export const obtenerAprendicesPorFichaId = async (idficha: 1) => {
  const { rows } = await Conexion.execute(
    "SELECT * FROM aprendiz WHERE ficha_idficha = ?",
    [idficha]
  );
  return rows;
};


// Listar aprendices
export const ListarAprendices = async () => {
  try {
    const query =`SELECT 
    a.nombres_aprendiz, a.apellidos_aprendiz, a.tipo_documento_idtipo_documento, a.documento_aprendiz, a.email_aprendiz, a.telefono_aprendiz 
    FROM aprendiz a`
    ;
    const result = await Conexion.query(query);
    return result;
  } catch (error) {
    console.error("Error al listar aprendices:", error);
    throw error;
  }
};

// Insertar aprendices desde Excel
export const insertarDatosExcelc = async (data: any[]) => {
  const errores: any[] = [];
  let insertados = 0;

  for (const [i, row] of data.entries()) {
    try {
      if (!validarAprendiz(row)) {
        throw new Error("Datos inválidos en la fila");
      }

      await Conexion.execute(
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
          row.documento_aprendiz,
          row.nombres_aprendiz,
          row.apellidos_aprendiz,          
          row.telefono_aprendiz,
          row.email_aprendiz,
          row.password_aprendiz,
          row.id_estadoAprendiz,
          row.id_TipoDocumento,
          row.tipo_documento_id,
        ]
      );

      insertados++;
    } catch (error) {
      errores.push({
        fila: i + 1,
        error: error.message,
      });
    }
  }

  return {
    success: errores.length === 0,
    insertados,
    errores,
  };
};



// import { Conexion } from "./conexion.ts";
// import { z } from "../Dependencies/dependencias.ts";

// interface agregarAprendiz {
//   idaprendiz: number | null;
//   documento_aprendiz: string;
//   nombres_aprendiz: string;
//   apellidos_aprendiz: string;
//   telefono_aprendiz: string;
//   email_aprendiz: string;
//   password_aprendiz: string;
//   ficha_idficha: number;
//   estado_aprendiz_idestado_aprendiz: number;
//   tipo_documento_idtipo_documento: number;
  
// }

// export const ListarAprendices = async () => {
//   try {
//     const query =`SELECT 
//     a.nombres_aprendiz, a.apellidos_aprendiz, a.tipo_documento_idtipo_documento, a.documento_aprendiz, a.email_aprendiz, a.telefono_aprendiz 
//     FROM aprendiz a`
//     ;
//     const result = await Conexion.query(query);
//     return result;
//   } catch (error) {
//     console.error("Error al listar aprendices:", error);
//     throw error;
//   }
// };


// export const insertarDatosExcelc = async (data: any[]) => {
//   try {
//     for (const row of data) {
//       await Conexion.execute(
        
//     []);
//     }
//     return { success: true, msg: "Datos insertados exitosamente" };
//   } catch (error) {
//     console.error("Error en insertarDatosExcel:", error);
//     return { success: false, msg: "Error al insertar datos en la base de datos"};
//   }
// };


// export const insertarDatosExcel = async (data: any[]) => {
//   try {
//     for (const row of data) {
//       await Conexion.execute(
//         `INSERT INTO aprendiz (
//         documento_aprendiz,nombres_aprendiz,apellidos_aprendiz,telefono_aprendiz,email_aprendiz,password_aprendiz,ficha_idficha,estado_aprendiz_idestado_aprendiz,tipo_documento_idtipo_documento
//         ) VALUES (
//         ?,?,?,?,?,?, ?, ?, ?
//         );`,
//     [row["documento"], row["nombres"], row["apellidos"], row["telefono"],row["email"], row["password"], row["ficha"], row["estado"],row["tipodocumento"]]);
//     }
//     return { success: true, msg: "Datos insertados exitosamente" };
//   } catch (error) {
//     console.error("Error en insertarDatosExcel:", error);
//     return { success: false, msg: "Error al insertar datos en la base de datos"};
//   }
// };


