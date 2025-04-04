import { listarFuncionario_Roles } from "../Models/funcModel.ts"

export const findFuncionarioById = async (ctx: any) => {
  const { response, params, request } = ctx;

  try {
    // Extraer ID de los parámetros de la URL
    const id = Number(params.id); // Asegurar que es un número

    if (!id) {
      response.status = 400;
      response.body = { success: false, msg: "ID es requerido" };
      return;
    }

    // Obtener la lista de funcionarios
    const funcionarios = await listarFuncionario_Roles();

    if (!funcionarios || funcionarios.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron funcionarios" };
      return;
    }

    // Buscar funcionario por ID
    const funcionario = funcionarios.find((func) => func.idFuncionario === id);

    if (!funcionario) {
      response.status = 404;
      response.body = { success: false, msg: "Funcionario no encontrado" };
      return;
    }

    // Responder con los datos del funcionario
    response.status = 200;
    response.body = { success: true, funcionario };
  } catch (error) {
    console.error("Error en findFuncionarioById:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};
