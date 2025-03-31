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