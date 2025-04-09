// deno-lint-ignore-file no-explicit-any
import { listarFuncionario_Roles } from "../Models/funcModel.ts"

// Read

export const listarInstructores = async (ctx: any) => {
  const { response } = ctx;

  try {
    const rol = "instructor"; // Puedes cambiar esto por otro rol si es necesario

    const instructores = await listarFuncionario_Roles(rol);

    if (!instructores || instructores.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron instructores" };
      return;
    }

    response.status = 200;
    response.body = { success: true, instructores };
  } catch (error) {
    console.error("Error al listar instructores:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const findFuncionarioById = async (ctx: any) => {
  const { response, params, request } = ctx;

  try {
    const id = Number(params.id);
    const rol = request.url.searchParams.get("rol") ?? undefined;

    if (!id) {
      response.status = 400;
      response.body = { success: false, msg: "ID es requerido" };
      return;
    }

    // Filtrar por rol si se proporciona
    const funcionarios = await listarFuncionario_Roles(rol);

    if (!funcionarios || funcionarios.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron funcionarios" };
      return;
    }

    const funcionario = funcionarios.find((func) => func.idFuncionario === id);

    if (!funcionario) {
      response.status = 404;
      response.body = { success: false, msg: "Funcionario no encontrado" };
      return;
    }

    response.status = 200;
    response.body = { success: true, funcionario };
  } catch (error) {
    console.error("Error en findFuncionarioById:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};


// Create

import { insertarFuncionario, insertarFuncionarioHasTipoFuncionario } from "../Models/funcModel.ts";

export const crearFuncionarioConRol = async (ctx: any) => {
  const { response, request } = ctx;

  try {
    const body = await request.body({ type: "json" }).value;

    // Validar campos mínimos
    const {
      documento,
      nombres,
      apellidos,
      email,
      telefono,
      url_imgFuncionario,
      id_tipoDocumento,
      id_tipoFuncionario,
      password
    } = body;

    if (!documento || !nombres || !apellidos || !email || !telefono || !id_tipoDocumento || !id_tipoFuncionario || !password) {
      response.status = 400;
      response.body = { success: false, msg: "Faltan campos requeridos" };
      return;
    }

    // Insertar en funcionario
    const funcionarioInsert = await insertarFuncionario({
      idFuncionario: null,
      documento,
      nombres,
      apellidos,
      email,
      telefono,
      url_imgFuncionario: url_imgFuncionario || null,
      id_tipoDocumento
    });

    // Obtener ID del funcionario insertado (si tu sistema devuelve lastInsertId)
    const idFuncionario = funcionarioInsert?.lastInsertId;

    if (!idFuncionario) {
      response.status = 500;
      response.body = { success: false, msg: "No se pudo insertar el funcionario" };
      return;
    }

    // Insertar en tabla de rompimiento
    await insertarFuncionarioHasTipoFuncionario(idFuncionario, id_tipoFuncionario, password);

    response.status = 201;
    response.body = { success: true, msg: "Funcionario creado con éxito", idFuncionario };
  } catch (error) {
    console.error("Error al crear funcionario:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};



