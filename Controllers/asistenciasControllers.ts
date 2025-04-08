// deno-lint-ignore-file no-explicit-any
import {
  listarAsistencia,
  listarTiposAsistencia,
} from "../Models/asistenciaModel.ts";

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
