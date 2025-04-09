import {listarProgramas, insertarProgramas} from"../Models/programaModel.ts";

export const getAllProgramas = async (ctx: any) => {
  const { response } = ctx;
  
  try {
    const programas = await listarProgramas();
    
    if (!programas ) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron programas" };
      return;
    }
    
    response.status = 200;
    response.body = { success: true, programas };
  } catch (error) {
    console.error("Error en getAllProgramas:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const createPrograma = async (ctx: any) => {
    const { request, response } = ctx;
  
    try {
      // Validar si el body tiene contenido
      if (!request.hasBody) {
        response.status = 400;
        response.body = { success: false, msg: "No se proporcionaron datos." };
        return;
      }
  
      const body = await request.body().value;
  
      const { codigo_programa, nombre_programa } = body;
  
      if (!codigo_programa || !nombre_programa) {
        response.status = 400;
        response.body = { success: false, msg: "Faltan campos requeridos." };
        return;
      }
  
      const result = await insertarProgramas(codigo_programa, nombre_programa);
  
      if (result.success) {
        response.status = 201;
        response.body = { success: true, msg: "Programa creado", id: result.id };
      } else {
        response.status = 500;
        response.body = { success: false, msg: "Error al insertar el programa." };
      }
    } catch (error) {
      console.error("Error en createPrograma:", error);
      response.status = 500;
      response.body = { success: false, msg: "Error interno del servidor." };
    }
  };

