import { listarFicha } from "../Models/tipoFichaModels.ts"; 


export const getTipoFichas =async (ctx:any)=>{
    const { response } = ctx;
    try {
        const tipoFichas = await listarFicha();
        if (!tipoFichas || tipoFichas.length === 0){
            response.status = 404;
            response.body = { success: false, msg: "No se encontraron Los tipos de Fichas" };
            return;
        }
        response.status = 200;
        response.body ={success: true,tipoFichas};
    } catch (error) {
        console.error("error en getTipoFichas",error);
        response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
    }
}