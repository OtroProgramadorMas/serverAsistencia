// deno-lint-ignore-file no-explicit-any
import {
  listarAsistencia,
  listarTiposAsistencia,
  listarAsistenciasPorAprendiz,
  crearAsistencia,
  actualizarAsistencia,
  eliminarAsistencia,
  verificarAsistenciasPorFechaYFicha,
  guardarAsistenciasMasivas,
  actualizarAsistenciasMasivas,
  AsistenciaMasiva
} from "../Models/asistenciaModel.ts";

// Listar todas las asistencias
export const getAsistencia = async (ctx: any) => {
  const { response } = ctx;

  try {
    const asistencias = await listarAsistencia();

    if (!asistencias) {
      response.status = 404;
      response.body = {
        success: false,
        msg: "No se encontraron asistencias registradas",
      };
      return;
    }

    response.status = 200;
    response.body = { success: true, asistencias };
  } catch (error) {
    console.error("Error en getAsistencia:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Obtener tipos de asistencia
export const getTiposAsistencia = async (ctx: any) => {
  const { response } = ctx;

  try {
    const tipos = await listarTiposAsistencia();

    if (!tipos || tipos.length === 0) {
      response.status = 404;
      response.body = {
        success: false,
        msg: "No hay tipos de asistencia registrados",
      };
      return;
    }

    response.status = 200;
    response.body = { success: true, tipos };
  } catch (error) {
    console.error("Error en getTiposAsistencia:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Obtener el historial de asistencias de un aprendiz
export const getAsistenciasByAprendizId = async (ctx: any) => {
  const { response, params } = ctx;
  
  try {
    const idAprendiz = Number(params.id);
    
    if (!idAprendiz) {
      response.status = 400;
      response.body = { success: false, msg: "ID de aprendiz es requerido" };
      return;
    }
    
    const asistencias = await listarAsistenciasPorAprendiz(idAprendiz);
    
    response.status = 200;
    response.body = { 
      success: true, 
      asistencias,
      total: asistencias.length
    };
  } catch (error) {
    console.error("Error en getAsistenciasByAprendizId:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Crear nueva asistencia
export const createAsistencia = async (ctx: any) => {
  const { request, response } = ctx;
  
  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }
    
    const body = await request.body().value;
    const { idAprendiz, idTipoAsistencia, fecha } = body;
    
    if (!idAprendiz || !idTipoAsistencia) {
      response.status = 400;
      response.body = { 
        success: false, 
        msg: "Se requiere idAprendiz e idTipoAsistencia" 
      };
      return;
    }
    
    const result = await crearAsistencia(
      Number(idAprendiz), 
      Number(idTipoAsistencia), 
      fecha
    );
    
    if (result.success) {
      response.status = 201;
      response.body = { 
        success: true, 
        msg: "Asistencia registrada correctamente",
        id: result.id
      };
    } else {
      response.status = 500;
      response.body = { 
        success: false, 
        msg: "Error al registrar asistencia",
        error: result.error
      };
    }
  } catch (error) {
    console.error("Error en createAsistencia:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Actualizar asistencia existente
export const updateAsistencia = async (ctx: any) => {
  const { params, request, response } = ctx;
  
  try {
    const idAsistencia = Number(params.id);
    
    if (!idAsistencia) {
      response.status = 400;
      response.body = { success: false, msg: "ID de asistencia es requerido" };
      return;
    }
    
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }
    
    const body = await request.body().value;
    const { idTipoAsistencia } = body;
    
    if (!idTipoAsistencia) {
      response.status = 400;
      response.body = { 
        success: false, 
        msg: "Se requiere idTipoAsistencia" 
      };
      return;
    }
    
    const result = await actualizarAsistencia(
      idAsistencia, 
      Number(idTipoAsistencia)
    );
    
    if (result.success) {
      response.status = 200;
      response.body = { 
        success: true, 
        msg: "Asistencia actualizada correctamente"
      };
    } else {
      response.status = 500;
      response.body = { 
        success: false, 
        msg: "Error al actualizar asistencia",
        error: result.error
      };
    }
  } catch (error) {
    console.error("Error en updateAsistencia:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Eliminar asistencia
export const deleteAsistencia = async (ctx: any) => {
  const { params, response } = ctx;
  
  try {
    const idAsistencia = Number(params.id);
    
    if (!idAsistencia) {
      response.status = 400;
      response.body = { success: false, msg: "ID de asistencia es requerido" };
      return;
    }
    
    const result = await eliminarAsistencia(idAsistencia);
    
    if (result.success) {
      response.status = 200;
      response.body = { 
        success: true, 
        msg: "Asistencia eliminada correctamente"
      };
    } else {
      response.status = 500;
      response.body = { 
        success: false, 
        msg: "Error al eliminar asistencia",
        error: result.error
      };
    }
  } catch (error) {
    console.error("Error en deleteAsistencia:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Verificar si existen asistencias para una fecha y ficha
export const checkAsistenciasByFechaAndFicha = async (ctx: any) => {
  const { request, response } = ctx;
  
  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }
    
    const body = await request.body.json();
    const { fecha, idFicha } = body;
    
    if (!fecha || !idFicha) {
      response.status = 400;
      response.body = { 
        success: false, 
        msg: "Se requiere fecha e idFicha" 
      };
      return;
    }
    
    const result = await verificarAsistenciasPorFechaYFicha(fecha, Number(idFicha));
    
    response.status = 200;
    response.body = { 
      success: true, 
      existenAsistencias: result.existen
    };
  } catch (error) {
    console.error("Error en checkAsistenciasByFechaAndFicha:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Crear asistencias masivas
export const createAsistenciasMasivas = async (ctx: any) => {
  const { request, response } = ctx;
  
  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }
    
    const body = await request.body.json();
    const { asistencias, fecha } = body;
    
    if (!asistencias || !Array.isArray(asistencias) || asistencias.length === 0 || !fecha) {
      response.status = 400;
      response.body = { 
        success: false, 
        msg: "Se requiere un array de asistencias y fecha válida" 
      };
      return;
    }
    
    const asistenciasMasivas: AsistenciaMasiva[] = asistencias.map((a: any) => ({
      idAprendiz: Number(a.idAprendiz),
      idTipoAsistencia: Number(a.idTipoAsistencia)
    }));
    
    const result = await guardarAsistenciasMasivas(asistenciasMasivas, fecha);
    
    if (result.success) {
      response.status = 201;
      response.body = { 
        success: true, 
        msg: "Asistencias registradas correctamente"
      };
    } else {
      response.status = 500;
      response.body = { 
        success: false, 
        msg: "Error al registrar asistencias masivas",
        error: result.error
      };
    }
  } catch (error) {
    console.error("Error en createAsistenciasMasivas:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Actualizar asistencias masivas
export const updateAsistenciasMasivas = async (ctx: any) => {
  const { request, response } = ctx;
  
  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }
    
    const body = await request.body.json();
    const { asistencias, fecha } = body;
    
    if (!asistencias || !Array.isArray(asistencias) || asistencias.length === 0 || !fecha) {
      response.status = 400;
      response.body = { 
        success: false, 
        msg: "Se requiere un array de asistencias y fecha válida" 
      };
      return;
    }
    
    const asistenciasMasivas: AsistenciaMasiva[] = asistencias.map((a: any) => ({
      idAprendiz: Number(a.idAprendiz),
      idTipoAsistencia: Number(a.idTipoAsistencia)
    }));
    
    const result = await actualizarAsistenciasMasivas(asistenciasMasivas, fecha);
    
    if (result.success) {
      response.status = 200;
      response.body = { 
        success: true, 
        msg: "Asistencias actualizadas correctamente"
      };
    } else {
      response.status = 500;
      response.body = { 
        success: false, 
        msg: "Error al actualizar asistencias masivas",
        error: result.error
      };
    }
  } catch (error) {
    console.error("Error en updateAsistenciasMasivas:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};