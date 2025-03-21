import { Conexion } from "./conexion.ts";

export interface aprendiz {
    idAprendiz: number | null;
    documento: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    email: string;
    password: string;
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