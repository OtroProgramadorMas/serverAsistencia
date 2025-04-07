import { buscarAprendizPorId, listarAprendices } from "../Models/datosAprendizModels.ts";

export const findAprendizById = async (ctx: any) => {
  const { response, params } = ctx;
  
  try {
    // Extraer ID de los parámetros de la URL
    const id = Number(params.id); // Asegurar que es un número
    
    if (!id) {
      response.status = 400;
      response.body = { success: false, msg: "ID es requerido" };
      return;
    }
    
    // Buscar aprendiz por ID directamente
    const aprendiz = await buscarAprendizPorId(id);
    
    if (!aprendiz) {
      response.status = 404;
      response.body = { success: false, msg: "Aprendiz no encontrado" };
      return;
    }
    
    // Responder con los datos del aprendiz
    response.status = 200;
    response.body = { success: true, aprendiz };
  } catch (error) {
    console.error("Error en findAprendizById:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const getAllAprendices = async (ctx: any) => {
  const { response } = ctx;
  
  try {
    const aprendices = await listarAprendices();
    
    if (!aprendices || aprendices.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron aprendices" };
      return;
    }
    
    response.status = 200;
    response.body = { success: true, aprendices };
  } catch (error) {
    console.error("Error en getAllAprendices:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};