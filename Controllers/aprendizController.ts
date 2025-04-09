// deno-lint-ignore-file
import {
  buscarAprendizPorId,
  listarAprendices,
} from "../Models/datosAprendizModels.ts";

import { listarAprendiz_Activos } from "../Models/aprendizModel.ts";

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

export const AprendicesByIdFicha = async (ctx: any) => {
  const { response, params } = ctx;
  try {
    const id = Number(params.id);

    if (!id) {
      response.status = 400;
      response.body = { success: false, msg: "ID es requerido" };
      return;
    }

    const aprendices = await listarAprendiz_Activos();

    if (!aprendices || aprendices.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron aprendices" };
      return;
    }

    const aprendicesFicha = aprendices.filter(
      (aprendiz) => aprendiz.ficha_idFicha === id
    );

    if (!aprendicesFicha || aprendicesFicha.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron aprendices para esta ficha" };
      return;
    }

    // Añadimos la respuesta exitosa que faltaba
    response.status = 200;
    response.body = { success: true, aprendices: aprendicesFicha };

  } catch (error) {
    console.error("Error en AprendicesByIdFicha:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};
