// deno-lint-ignore-file no-explicit-any
import {
  listarProgramas, 
  insertarProgramas, 
  buscarProgramaPorId,
  actualizarPrograma,
  eliminarPrograma,
  verificarProgramaEnFicha
} from "../Models/programaModel.ts";

export const getAllProgramas = async (ctx: any) => {
  const { response } = ctx;
  
  try {
    const programas = await listarProgramas();
    
    response.status = 200;
    response.body = { success: true, programas };
  } catch (error) {
    console.error("Error en getAllProgramas:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const getProgramaById = async (ctx: any) => {
  const { params, response } = ctx;
  
  try {
    const idprograma = parseInt(params.id);
    
    if (isNaN(idprograma)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de programa inválido" };
      return;
    }
    
    const programa = await buscarProgramaPorId(idprograma);
    
    if (!programa) {
      response.status = 404;
      response.body = { success: false, msg: "Programa no encontrado" };
      return;
    }
    
    response.status = 200;
    response.body = { success: true, programa };
  } catch (error) {
    console.error("Error en getProgramaById:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const createPrograma = async (ctx: any) => {
  const { request, response } = ctx;

  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos." };
      return;
    }

    const body = await request.body.json();

    const { codigo_programa, nombre_programa } = body;

    if (!codigo_programa?.trim() || !nombre_programa?.trim()) {
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
      response.body = { success: false, msg: result.msg || "Error al insertar el programa." };
    }
  } catch (error) {
    console.error("Error en createPrograma:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor." };
  }
};

export const updatePrograma = async (ctx: any) => {
  const { params, request, response } = ctx;
  
  try {
    const idprograma = parseInt(params.id);
    
    if (isNaN(idprograma)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de programa inválido" };
      return;
    }
    
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos." };
      return;
    }
    
    const body = await request.body.json();
    
    const { codigo_programa, nombre_programa } = body;
    
    if (!codigo_programa?.trim() || !nombre_programa?.trim()) {
      response.status = 400;
      response.body = { success: false, msg: "Faltan campos requeridos." };
      return;
    }
    
    // Verificar si el programa existe
    const programa = await buscarProgramaPorId(idprograma);
    
    if (!programa) {
      response.status = 404;
      response.body = { success: false, msg: "Programa no encontrado" };
      return;
    }
    
    const result = await actualizarPrograma(idprograma, codigo_programa, nombre_programa);
    
    if (result.success) {
      response.status = 200;
      response.body = { success: true, msg: "Programa actualizado correctamente" };
    } else {
      response.status = 500;
      response.body = { success: false, msg: result.msg || "Error al actualizar el programa." };
    }
  } catch (error) {
    console.error("Error en updatePrograma:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor." };
  }
};

export const deletePrograma = async (ctx: any) => {
  const { params, response } = ctx;
  
  try {
    const idprograma = parseInt(params.id);
    
    if (isNaN(idprograma)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de programa inválido" };
      return;
    }
    
    // Verificar si el programa existe
    const programa = await buscarProgramaPorId(idprograma);
    
    if (!programa) {
      response.status = 404;
      response.body = { success: false, msg: "Programa no encontrado" };
      return;
    }
    
    // Verificar si el programa está en uso en alguna ficha
    const programaEnUso = await verificarProgramaEnFicha(idprograma);
    
    if (programaEnUso) {
      response.status = 400;
      response.body = { 
        success: false, 
        msg: "No se puede eliminar el programa porque está asociado a una o más fichas." 
      };
      return;
    }
    
    const result = await eliminarPrograma(idprograma);
    
    if (result.success) {
      response.status = 200;
      response.body = { success: true, msg: "Programa eliminado correctamente" };
    } else {
      response.status = 500;
      response.body = { success: false, msg: result.msg || "Error al eliminar el programa." };
    }
  } catch (error) {
    console.error("Error en deletePrograma:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor." };
  }
};