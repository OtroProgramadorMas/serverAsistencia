import {
  obtenerAprendizPorId,
  listarAprendices,
  buscarAprendicesPorDocumento,
  crearAprendiz, 
  actualizarAprendiz,
  eliminarAprendiz, 
  obtenerAprendicesPorFicha,
  Aprendiz,
  listarEstadosAprendiz
} from "../Models/aprendizModel.ts";
import { listarEstadosFicha } from "../Models/fichaModel.ts";

export const findAprendizById = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    // Extraer ID de los parámetros de la URL
    const id = Number(params.id); // Asegurar que es un número

    if (!id || isNaN(id)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de aprendiz inválido" };
      return;
    }

    // Buscar aprendiz por ID
    const result = await obtenerAprendizPorId(id);

    if (!result.success) {
      response.status = 404;
      response.body = { success: false, msg: result.msg || "Aprendiz no encontrado" };
      return;
    }

    // Responder con los datos del aprendiz
    response.status = 200;
    response.body = { success: true, aprendiz: result.aprendiz };
  } catch (error) {
    console.error("Error en findAprendizById:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const getAllAprendices = async (ctx: any) => {
  const { response } = ctx;

  try {
    const result = await listarAprendices();

    if (!result.success) {
      response.status = 404;
      response.body = { success: false, msg: result.msg || "Error al obtener aprendices" };
      return;
    }

    if (!result.aprendices || result.aprendices.length === 0) {
      response.status = 200;
      response.body = { success: true, aprendices: [], msg: "No hay aprendices registrados" };
      return;
    }

    response.status = 200;
    response.body = { success: true, aprendices: result.aprendices };
  } catch (error) {
    console.error("Error en getAllAprendices:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const getEstadosAprendiz = async (ctx: any) => {
  const { response } = ctx;

  try {
    const estados_aprendiz = await listarEstadosFicha();
    response.status = 200;
    response.body = { success: true, estados_aprendiz };
  } catch (error) {
    console.error("Error en getEstadosAprendiz:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};


export const findAprendicesByDocumento = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const documento = params.documento;

    if (!documento) {
      response.status = 400;
      response.body = { success: false, msg: "Documento es requerido" };
      return;
    }

    const result = await buscarAprendicesPorDocumento(documento);

    if (!result.success) {
      response.status = 404;
      response.body = { success: false, msg: result.msg || "Error al buscar aprendices" };
      return;
    }

    if (!result.aprendices || result.aprendices.length === 0) {
      response.status = 404;
      response.body = { success: true, msg: "No se encontraron aprendices con ese documento" };
      return;
    }

    response.status = 200;
    response.body = { success: true, aprendices: result.aprendices };
  } catch (error) {
    console.error("Error en findAprendicesByDocumento:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const findAprendicesByFicha = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const fichaId = Number(params.fichaId);

    if (!fichaId || isNaN(fichaId)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de ficha inválido" };
      return;
    }

    const result = await obtenerAprendicesPorFicha(fichaId);

    if (!result.success) {
      response.status = 404;
      response.body = { success: false, msg: result.msg || "Error al obtener aprendices de la ficha" };
      return;
    }

    response.status = 200;
    response.body = { 
      success: true, 
      aprendices: result.aprendices || [],
      cantidad: result.aprendices ? result.aprendices.length : 0
    };
  } catch (error) {
    console.error("Error en findAprendicesByFicha:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const createAprendiz = async (ctx: any) => {
  const { request, response } = ctx;
  
  if (!request.hasBody) {
    response.status = 400;
    response.body = { success: false, msg: "Datos del aprendiz son requeridos" };
    return;
  }

  try {
    const body = await request.body().value;
    const requiredFields = [
      'documento_aprendiz', 
      'nombres_aprendiz', 
      'apellidos_aprendiz', 
      'telefono_aprendiz',
      'email_aprendiz',
      'password_aprendiz',
      'ficha_idficha',
      'tipo_documento_idtipo_documento'
    ];

    // Verificar campos requeridos
    for (const field of requiredFields) {
      if (!body[field]) {
        response.status = 400;
        response.body = { success: false, msg: `El campo ${field} es requerido` };
        return;
      }
    }

    // Crear nuevo aprendiz sin ID (será generado por la BD)
    const nuevoAprendiz: Omit<Aprendiz, 'idaprendiz'> = {
      documento_aprendiz: body.documento_aprendiz,
      nombres_aprendiz: body.nombres_aprendiz,
      apellidos_aprendiz: body.apellidos_aprendiz,
      telefono_aprendiz: body.telefono_aprendiz,
      email_aprendiz: body.email_aprendiz,
      password_aprendiz: body.password_aprendiz,
      ficha_idficha: Number(body.ficha_idficha),
      estado_aprendiz_idestado_aprendiz: 2, // Por defecto es 2
      tipo_documento_idtipo_documento: Number(body.tipo_documento_idtipo_documento)
    };

    const result = await crearAprendiz(nuevoAprendiz);

    if (!result.success) {
      response.status = 400;
      response.body = { 
        success: false, 
        msg: result.msg || "Error al crear el aprendiz",
        error: result.error
      };
      return;
    }

    response.status = 201;
    response.body = { 
      success: true, 
      msg: "Aprendiz creado exitosamente",
      idaprendiz: result.idaprendiz
    };
  } catch (error) {
    console.error("Error en createAprendiz:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const updateAprendiz = async (ctx: any) => {
  const { request, response, params } = ctx;
  
  if (!request.hasBody) {
    response.status = 400;
    response.body = { success: false, msg: "Datos para actualizar son requeridos" };
    return;
  }

  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de aprendiz inválido" };
      return;
    }

    const body = await request.body().value;
    
    // Verificar que existan campos para actualizar
    if (Object.keys(body).length === 0) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron campos para actualizar" };
      return;
    }

    // Convertir campos numéricos si existen
    if (body.ficha_idficha) body.ficha_idficha = Number(body.ficha_idficha);
    if (body.estado_aprendiz_idestado_aprendiz) body.estado_aprendiz_idestado_aprendiz = Number(body.estado_aprendiz_idestado_aprendiz);
    if (body.tipo_documento_idtipo_documento) body.tipo_documento_idtipo_documento = Number(body.tipo_documento_idtipo_documento);

    const result = await actualizarAprendiz(id, body);

    if (!result.success) {
      response.status = 404;
      response.body = { 
        success: false, 
        msg: result.msg || "Error al actualizar el aprendiz",
        error: result.error
      };
      return;
    }

    response.status = 200;
    response.body = { 
      success: true, 
      msg: "Aprendiz actualizado exitosamente" 
    };
  } catch (error) {
    console.error("Error en updateAprendiz:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const deleteAprendiz = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de aprendiz inválido" };
      return;
    }

    const result = await eliminarAprendiz(id);

    if (!result.success) {
      response.status = 404;
      response.body = { 
        success: false, 
        msg: result.msg || "Error al eliminar el aprendiz",
        error: result.error
      };
      return;
    }

    response.status = 200;
    response.body = { 
      success: true, 
      msg: "Aprendiz eliminado exitosamente" 
    };
  } catch (error) {
    console.error("Error en deleteAprendiz:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};