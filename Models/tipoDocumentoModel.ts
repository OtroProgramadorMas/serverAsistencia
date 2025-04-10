import  { Conexion } from "./conexion.ts";

export interface tipo_documento{
    idtipo_documento: number | null;
    tipo_documento: string;
}
 export const listarTipoDoc = async ()=> {
    try {
        const result = await Conexion.query("select idtipo_documento,tipo_documento from tipo_documento");
        return result as tipo_documento[];
    } catch (error) {
        console.error ("error al listar Aprendices",error);
        return[];
    }
 }