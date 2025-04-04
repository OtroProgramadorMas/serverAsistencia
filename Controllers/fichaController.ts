import { listarFichasPorEstados } from "../Models/fichaModel.ts";

export const fichasByIdfunc = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const id = Number(params.id);

    if (!id) {
      response.status = 400;
      response.body = { success: false, msg: "ID es requerido" };
      return;
    }

    const fichas = await listarFichasPorEstados();

    if (!fichas || fichas.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron fichas" };
      return;
    }

    // Filtrar las fichas que tengan el id del funcionario
    const fichasFiltradas = fichas.filter(
      (ficha) => ficha.funcionario_idfuncionario === id
    );

    if (fichasFiltradas.length === 0) {
      response.status = 404;
      response.body = {
        success: false,
        msg: "No se encontraron fichas para este funcionario",
      };
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      data: fichasFiltradas,
    };
  } catch (error) {
    console.error("Error en fichasByIdfunc:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};
