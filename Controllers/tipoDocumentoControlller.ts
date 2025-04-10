import { listarTipoDoc } from "../Models/tipoDocumentoModel.ts";


export const getTipoDocumentos =async (ctx:any)=>{
    const { response } = ctx;
    try {
        const tipoDocumento = await listarTipoDoc();
        if (!tipoDocumento || tipoDocumento.length === 0){
            response.status = 404;
            response.body = { success: false, msg: "No se encontraron Los tipos de Documentos" };
            return;
        }
        response.status = 200;
        response.body ={success: true,tipoDocumento};
    } catch (error) {
        console.error("error en getTipoDocumentos",error);
        response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
    }
}