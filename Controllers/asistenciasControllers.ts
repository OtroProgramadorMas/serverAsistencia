import { listarAsistencia } from "../Models/asistenciaModel.ts";

// deno-lint-ignore no-explicit-any
export const getAsistencia = async (ctx: any)=>{
    const result = await listarAsistencia();
    ctx.response.status = 200;
    ctx.response.body ={
        success: true,
        data: result,
    };
};