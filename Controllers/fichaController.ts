import {
  listarFichasPorEstados,
  listarFichasPorPrograma,
  buscarFichaPorId,
  listarEstadosFicha,
  crearFicha,
  actualizarFicha,
  eliminarFicha,
  asignarInstructorAFicha,
  removerInstructorDeFicha,
  verificarAprendicesEnFicha
} from "../Models/fichaModel.ts";


/*

Gets

*/


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

export const getFichasPorPrograma = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const programa_id = Number(params.programa_id);

    if (isNaN(programa_id)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de programa inválido" };
      return;
    }

    const fichas = await listarFichasPorPrograma(programa_id);
    response.status = 200;
    response.body = { success: true, fichas };
  } catch (error) {
    console.error("Error en getFichasPorPrograma:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const getFichaPorId = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const idficha = Number(params.id);

    if (isNaN(idficha)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de ficha inválido" };
      return;
    }

    const ficha = await buscarFichaPorId(idficha);

    if (!ficha) {
      response.status = 404;
      response.body = { success: false, msg: "Ficha no encontrada" };
      return;
    }

    response.status = 200;
    response.body = { success: true, ficha };
  } catch (error) {
    console.error("Error en getFichaPorId:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const getEstadosFicha = async (ctx: any) => {
  const { response } = ctx;

  try {
    const estados = await listarEstadosFicha();
    response.status = 200;
    response.body = { success: true, estados };
  } catch (error) {
    console.error("Error en getEstadosFicha:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};


/*

Create Update y Delete

*/


export const createFicha = async (ctx: any) => {
  const { request, response } = ctx;

  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }

    const body = await request.body.json();

    // Validar campos obligatorios
    if (!body.codigo?.trim() || !body.fecha_inicio?.trim() ||
      !body.programa_idprograma || !body.estado_ficha_idestado_ficha) {
      response.status = 400;
      response.body = { success: false, msg: "Faltan campos requeridos" };
      return;
    }

    const result = await crearFicha({
      codigo: body.codigo,
      fecha_inicio: body.fecha_inicio,
      programa_idprograma: body.programa_idprograma,
      estado_ficha_idestado_ficha: body.estado_ficha_idestado_ficha
    });

    if (result.success) {
      // Si se proporcionó un instructor, lo asignamos a la ficha
      if (body.funcionario_id) {
        await asignarInstructorAFicha(result.id, body.funcionario_id);
      }

      response.status = 201;
      response.body = {
        success: true,
        msg: "Ficha creada exitosamente",
        id: result.id
      };
    } else {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.msg || "Error al crear la ficha"
      };
    }
  } catch (error) {
    console.error("Error en createFicha:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const updateFicha = async (ctx: any) => {
  const { request, response, params } = ctx;

  try {
    const idficha = Number(params.id);

    if (isNaN(idficha)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de ficha inválido" };
      return;
    }

    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }

    const body = await request.body.json();

    // Verificar si la ficha existe
    const ficha = await buscarFichaPorId(idficha);
    if (!ficha) {
      response.status = 404;
      response.body = { success: false, msg: "Ficha no encontrada" };
      return;
    }

    // Actualizar la ficha
    const result = await actualizarFicha(idficha, {
      codigo: body.codigo,
      fecha_inicio: body.fecha_inicio,
      programa_idprograma: body.programa_idprograma,
      estado_ficha_idestado_ficha: body.estado_ficha_idestado_ficha
    });

    // Manejar asignación o cambio de instructor si se proporcionó
    if (body.funcionario_id && result.success) {
      await asignarInstructorAFicha(idficha, body.funcionario_id);
    }

    if (result.success) {
      response.status = 200;
      response.body = { success: true, msg: "Ficha actualizada exitosamente" };
    } else {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.msg || "Error al actualizar la ficha"
      };
    }
  } catch (error) {
    console.error("Error en updateFicha:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const deleteFicha = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const idficha = Number(params.id);

    if (isNaN(idficha)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de ficha inválido" };
      return;
    }

    // Verificar si la ficha existe
    const ficha = await buscarFichaPorId(idficha);
    if (!ficha) {
      response.status = 404;
      response.body = { success: false, msg: "Ficha no encontrada" };
      return;
    }

    // Verificar si la ficha tiene aprendices asociados
    const fichaConAprendices = await verificarAprendicesEnFicha(idficha);

    if (fichaConAprendices) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "No se puede eliminar la ficha porque tiene aprendices asociados"
      };
      return;
    }

    const result = await eliminarFicha(idficha);

    if (result.success) {
      response.status = 200;
      response.body = { success: true, msg: "Ficha eliminada exitosamente" };
    } else {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.msg || "Error al eliminar la ficha"
      };
    }
  } catch (error) {
    console.error("Error en deleteFicha:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};


/*

Asignar y remover instructores

*/


export const asignarInstructor = async (ctx: any) => {
  const { request, response, params } = ctx;

  try {
    const idficha = Number(params.id);

    if (isNaN(idficha)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de ficha inválido" };
      return;
    }

    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }

    const body = await request.body.json();

    if (!body.funcionario_id) {
      response.status = 400;
      response.body = { success: false, msg: "ID de funcionario es requerido" };
      return;
    }

    // Verificar si la ficha existe
    const ficha = await buscarFichaPorId(idficha);
    if (!ficha) {
      response.status = 404;
      response.body = { success: false, msg: "Ficha no encontrada" };
      return;
    }

    const result = await asignarInstructorAFicha(idficha, body.funcionario_id);

    if (result.success) {
      response.status = 200;
      response.body = {
        success: true,
        msg: result.msg || "Instructor asignado exitosamente"
      };
    } else {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.msg || "Error al asignar instructor"
      };
    }
  } catch (error) {
    console.error("Error en asignarInstructor:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const removerInstructor = async (ctx: any) => {
  const { request, response, params } = ctx;

  try {
    const idficha = Number(params.id);

    if (isNaN(idficha)) {
      response.status = 400;
      response.body = { success: false, msg: "ID de ficha inválido" };
      return;
    }

    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "No se proporcionaron datos" };
      return;
    }

    const body = await request.body.json();

    if (!body.funcionario_id) {
      response.status = 400;
      response.body = { success: false, msg: "ID de funcionario es requerido" };
      return;
    }

    const result = await removerInstructorDeFicha(idficha, body.funcionario_id);

    if (result.success) {
      response.status = 200;
      response.body = { success: true, msg: "Instructor removido exitosamente" };
    } else {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.msg || "Error al remover instructor"
      };
    }
  } catch (error) {
    console.error("Error en removerInstructor:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};