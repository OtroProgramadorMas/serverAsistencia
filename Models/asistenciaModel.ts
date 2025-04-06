import { Conexion } from "./conexion.ts";

export interface asistencia{
    idasistencia: number | null;
    fecha_asistencia: Date;
    nombre_tipo_asistencia: string;
    documento_aprendiz: number;
    nombre_aprendiz: string;
    apellidos_aprendiz: string;
    telefono_aprendiz: number;
    email_aprendiz: string
    aprendiz_idaprendiz: number;
    tipo_asistencia_idtipo_asistencia: number;
}

export const listarAsistencia = async ()=>{
    try {
        const result = await Conexion.query('SELECT a.idasistencia, a.fecha_asistencia,ta.nombre_tipo_asistencia, ap.documento_aprendiz,ap.nombres_aprendiz,ap.apellidos_aprendiz,ap.telefono_aprendiz, ap.email_aprendiz FROM edu_sena.asistencia a INNER JOIN edu_sena.tipo_asistencia ta ON a.tipo_asistencia_idtipo_asistencia = ta.idtipo_asistencia INNER JOIN edu_sena.aprendiz ap ON a.aprendiz_idaprendiz = ap.idaprendiz ORDER BY a.fecha_asistencia DESC, ap.apellidos_aprendiz, ap.nombres_aprendiz');
        return result  as asistencia
    } catch (error) {
        console.error("Error al listar Aprendices", error);
        return[];
    }


}