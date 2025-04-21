import { Conexion } from "./conexion.ts";

export interface ficha{
    codigo_ficha: number ;
   
}
 export const listarFicha = async ()=> {
    try {
        const result = await Conexion.query("SELECT codigo_ficha FROM ficha");
        return result as ficha[];
    } catch (error) {
        console.error ("error al listar fichas",error);
        return[];
    }
 }


