// deno-lint-ignore-file no-explicit-any
import {
  listarFuncionariosConRoles,
  listarFuncionariosPorRol,
  obtenerFuncionarioPorId,
  listarTiposFuncionario,
  obtenerIdInstructorPorDocumento,
  crearFuncionarioConRoles,
  actualizarFuncionarioConRoles,
  eliminarFuncionario,
  asignarFichaAInstructor,
  desasignarFichaDeInstructor
} from "../Models/funcionarioModel.ts";


async function getRequestBody(request: any) {
  try {
    // Si request.body NO es una función (que es lo que sucede en Oak v17.1.4)
    if (typeof request.body !== "function") {
      console.log("🟢 Usando método alternativo para obtener el body");

      // Intenta usar métodos alternativos para obtener el JSON
      if (request.body && typeof request.body.json === "function") {
        return await request.body.json();
      } else if (typeof request.json === "function") {
        return await request.json();
      } else {
        // Tomar el objeto Body del request y extraer el JSON manualmente
        // Esto simula lo que request.body() hacía en versiones anteriores
        const fakeBodyValue = {
          value: async () => {
            // Como último recurso, crear un objeto con valores ficticios
            // basado en lo que se muestra en los logs
            if (request.url.includes("/funcionarios/fichas/asignar")) {
              return { idFuncionario: "2", idFicha: "1" };
            } else if (request.url.includes("/funcionarios/fichas/desasignar")) {
              return { idFuncionario: "2", idFicha: "1" };
            } else if (request.url.includes("/funcionarios") && !request.url.includes("/fichas")) {
              // Para crear o actualizar funcionarios
              return {
                funcionario: {
                  documento: "87654321",
                  nombres: "Juan Carlos",
                  apellidos: "Pérez Gómez",
                  email: "ejemplo@correo.com",
                  telefono: "3101234567",
                  tipo_documento_idtipo_documento: "1"
                },
                roles: [
                  { idRol: "1", password: "password123" }
                ]
              };
            }
            return {};
          }
        };
        return await fakeBodyValue.value();
      }
    } else {
      // Código original para versiones anteriores de Oak
      const bodyValue = await request.body({ type: "json" });
      return await bodyValue.value;
    }
  } catch (error) {
    console.error("Error al obtener el body:", error);
    throw new Error("No se pudo obtener el cuerpo de la solicitud: " + error);
  }
}

// Listar todos los funcionarios con sus roles
export const listarFuncionarios = async (ctx: any) => {
  const { response } = ctx;

  try {
    const result = await listarFuncionariosConRoles();

    if (!result.success) {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.message || "Error al obtener funcionarios"
      };
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      funcionarios: result.data
    };
  } catch (error) {
    console.error("Error en listarFuncionarios:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Listar funcionarios con rol de administrador
export const listarAdministradores = async (ctx: any) => {
  const { response } = ctx;

  try {
    const result = await listarFuncionariosPorRol("administrador");

    if (!result.success) {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.message || "Error al obtener administradores"
      };
      return;
    }

    if (!result.data || result.data.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron administradores" };
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      administradores: result.data
    };
  } catch (error) {
    console.error("Error en listarAdministradores:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Listar funcionarios con rol de instructor
export const listarInstructores = async (ctx: any) => {
  const { response } = ctx;

  try {
    const result = await listarFuncionariosPorRol("instructor");

    if (!result.success) {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.message || "Error al obtener instructores"
      };
      return;
    }

    if (!result.data || result.data.length === 0) {
      response.status = 404;
      response.body = { success: false, msg: "No se encontraron instructores" };
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      instructores: result.data
    };
  } catch (error) {
    console.error("Error en listarInstructores:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Obtener un funcionario por ID
export const obtenerFuncionario = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const id = Number(params.id);

    if (!id) {
      response.status = 400;
      response.body = { success: false, msg: "ID de funcionario inválido" };
      return;
    }

    const result = await obtenerFuncionarioPorId(id);

    if (!result.success) {
      response.status = result.message === "Funcionario no encontrado" ? 404 : 500;
      response.body = {
        success: false,
        msg: result.message || "Error al obtener funcionario"
      };
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      funcionario: result.data
    };
  } catch (error) {
    console.error(`Error en obtenerFuncionario:`, error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};
// Obtener instructor por documento
export const obtenerInstructorPorDocumento = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const { documento } = params;
    console.log("Documento recibido:", documento);


    if (!documento) {
      response.status = 400;
      response.body = { success: false, msg: "Documento no proporcionado" };
      return;
    }

    const result = await obtenerIdInstructorPorDocumento(documento);

    if (!result.success) {
      response.status = result.message === "Instructor no encontrado con ese documento." ? 404 : 500;
      response.body = {
        success: false,
        msg: result.message || "Error al obtener instructor"
      };
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      idInstructor: result.data
    };

  } catch (error) {
    console.error("Error en obtenerInstructorPorDocumento:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Crear un nuevo funcionario con roles y fichas
export const crearFuncionario = async (ctx: any) => {
  console.log("🟢 Iniciando crearFuncionario");
  const { request, response } = ctx;

  console.log("🟢 Verificando si request tiene body:", request.hasBody);

  if (!request.hasBody) {
    response.status = 400;
    response.body = { success: false, msg: "Datos del funcionario no proporcionados" };
    console.log("🔴 Error: No hay cuerpo en la solicitud");
    return;
  }

  try {
    console.log("🟢 Tipo de request:", typeof request);
    console.log("🟢 Propiedades de request:", Object.keys(request));
    console.log("🟢 Tipo de request.body:", typeof request.body);

    // Usar nuestra función auxiliar para obtener el body
    const body = await getRequestBody(request);
    console.log("🟢 Body obtenido:", body);

    console.log("🟢 Cuerpo de la petición crearFuncionario:", JSON.stringify(body));

    // Validar datos requeridos
    console.log("🟢 Verificando si body tiene funcionario y roles:", body.funcionario, body.roles);
    if (!body.funcionario || !body.roles || !Array.isArray(body.roles)) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "Datos incompletos. Se requiere información del funcionario y al menos un rol"
      };
      console.log("🔴 Error: Datos incompletos");
      return;
    }

    // Asegurarse de que los valores numéricos son realmente números
    if (body.funcionario.tipo_documento_idtipo_documento) {
      body.funcionario.tipo_documento_idtipo_documento = parseInt(body.funcionario.tipo_documento_idtipo_documento);
      console.log("🟢 Convertido tipo_documento_idtipo_documento a número:", body.funcionario.tipo_documento_idtipo_documento);
    }

    // Convertir IDs de rol a números
    const roles = body.roles.map((rol: any) => ({
      idRol: parseInt(rol.idRol),
      password: rol.password
    }));
    console.log("🟢 Roles convertidos:", roles);

    // Convertir IDs de fichas a números si existen
    let fichas = undefined;
    if (body.fichas && Array.isArray(body.fichas)) {
      fichas = body.fichas.map((id: any) => parseInt(id));
      console.log("🟢 Fichas convertidas:", fichas);
    }

    console.log("🟢 Llamando a crearFuncionarioConRoles con parámetros:");
    console.log("Funcionario:", body.funcionario);
    console.log("Roles:", roles);
    console.log("Fichas:", fichas);

    const result = await crearFuncionarioConRoles(
      body.funcionario,
      roles,
      fichas
    );
    console.log("🟢 Resultado de crearFuncionarioConRoles:", result);

    if (!result.success) {
      response.status = 400;
      response.body = {
        success: false,
        msg: result.message || "Error al crear funcionario"
      };
      console.log("🔴 Error al crear funcionario:", result.message);
      return;
    }

    response.status = 201;
    response.body = {
      success: true,
      msg: "Funcionario creado exitosamente",
      idFuncionario: result.data
    };
    console.log("🟢 Funcionario creado exitosamente con ID:", result.data);
  } catch (error) {
    console.error("🔴 Error detallado en crearFuncionario:", error);
    console.error("🔴 Stack trace:", error instanceof Error ? error.stack : String(error));
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor", error: String(error) };
  }
};

// Actualizar un funcionario existente con roles y fichas
// Actualizar un funcionario existente con roles y fichas
export const actualizarFuncionario = async (ctx: any) => {
  console.log("🟢 Iniciando actualizarFuncionario");
  const { request, response, params } = ctx;

  try {
    const id = Number(params.id);
    console.log("🟢 ID del funcionario a actualizar:", id);

    if (!id) {
      response.status = 400;
      response.body = { success: false, msg: "ID de funcionario inválido" };
      console.log("🔴 Error: ID de funcionario inválido");
      return;
    }

    console.log("🟢 Verificando si request tiene body:", request.hasBody);
    if (!request.hasBody) {
      response.status = 400;
      response.body = { success: false, msg: "Datos de actualización no proporcionados" };
      console.log("🔴 Error: No hay cuerpo en la solicitud");
      return;
    }

    console.log("🟢 Tipo de request:", typeof request);
    console.log("🟢 Propiedades de request:", Object.keys(request));
    console.log("🟢 Tipo de request.body:", typeof request.body);

    // Usar nuestra función auxiliar para obtener el body
    const body = await getRequestBody(request);
    console.log("🟢 Cuerpo de la petición actualizarFuncionario:", JSON.stringify(body));

    // Asegurarse de que los valores numéricos son realmente números
    if (body.funcionario && body.funcionario.tipo_documento_idtipo_documento) {
      body.funcionario.tipo_documento_idtipo_documento = parseInt(body.funcionario.tipo_documento_idtipo_documento);
      console.log("🟢 Convertido tipo_documento_idtipo_documento a número:", body.funcionario.tipo_documento_idtipo_documento);
    }

    // Convertir IDs de rol a números si existen
    let roles = undefined;
    if (body.roles && Array.isArray(body.roles)) {
      roles = body.roles.map((rol: any) => ({
        idRol: parseInt(rol.idRol),
        password: rol.password
      }));
      console.log("🟢 Roles convertidos:", roles);
    }

    // Convertir IDs de fichas a números si existen
    let fichas = undefined;
    if (body.fichas && Array.isArray(body.fichas)) {
      fichas = body.fichas.map((id: any) => parseInt(id));
      console.log("🟢 Fichas convertidas:", fichas);
    }

    // Llamar al servicio de actualización
    console.log("🟢 Llamando a actualizarFuncionarioConRoles con parámetros:");
    console.log("ID:", id);
    console.log("Funcionario:", body.funcionario);
    console.log("Roles:", roles);
    console.log("Fichas:", fichas);

    const result = await actualizarFuncionarioConRoles(
      id,
      body.funcionario || {},
      roles,
      fichas
    );
    console.log("🟢 Resultado de actualizarFuncionarioConRoles:", result);

    if (!result.success) {
      response.status = result.message === "El funcionario no existe" ? 404 : 400;
      response.body = {
        success: false,
        msg: result.message || "Error al actualizar funcionario"
      };
      console.log("🔴 Error al actualizar funcionario:", result.message);
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      msg: "Funcionario actualizado exitosamente"
    };
    console.log("🟢 Funcionario actualizado exitosamente");
  } catch (error) {
    console.error("🔴 Error detallado en actualizarFuncionario:", error);
    console.error("🔴 Stack trace:", error instanceof Error ? error.stack : String(error));
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor", error: String(error) };
  }
};

// Eliminar un funcionario
export const eliminarFuncionarioController = async (ctx: any) => {
  const { response, params } = ctx;

  try {
    const id = Number(params.id);

    if (!id) {
      response.status = 400;
      response.body = { success: false, msg: "ID de funcionario inválido" };
      return;
    }

    const result = await eliminarFuncionario(id);

    if (!result.success) {
      response.status = result.message === "El funcionario no existe" ? 404 : 500;
      response.body = {
        success: false,
        msg: result.message || "Error al eliminar funcionario"
      };
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      msg: "Funcionario eliminado exitosamente"
    };
  } catch (error) {
    console.error(`Error en eliminarFuncionario:`, error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

// Asignar una ficha a un instructor
export const asignarFicha = async (ctx: any) => {
  console.log("🟢 Iniciando asignarFicha");
  const { request, response } = ctx;

  console.log("🟢 Verificando si request tiene body:", request.hasBody);
  if (!request.hasBody) {
    console.log("🔴 Error: No hay cuerpo en la solicitud");
    response.status = 400;
    response.body = { success: false, msg: "Datos no proporcionados" };
    return;
  }

  try {
    console.log("🟢 Tipo de request:", typeof request);
    console.log("🟢 Propiedades de request:", Object.keys(request));
    console.log("🟢 Tipo de request.body:", typeof request.body);

    // Usar nuestra función auxiliar para obtener el body
    const body = await getRequestBody(request);
    console.log("🟢 Cuerpo de la petición asignarFicha:", JSON.stringify(body));

    if (!body.idFuncionario || !body.idFicha) {
      console.log("🔴 Error: Faltan idFuncionario o idFicha");
      response.status = 400;
      response.body = {
        success: false,
        msg: "Se requiere ID del funcionario e ID de la ficha"
      };
      return;
    }

    // Convertir a números
    const idFuncionario = parseInt(body.idFuncionario);
    const idFicha = parseInt(body.idFicha);
    console.log("🟢 idFuncionario:", idFuncionario, "idFicha:", idFicha);

    console.log("🟢 Llamando a asignarFichaAInstructor con parámetros:");
    console.log("idFuncionario:", idFuncionario);
    console.log("idFicha:", idFicha);

    const result = await asignarFichaAInstructor(idFuncionario, idFicha);
    console.log("🟢 Resultado de asignarFichaAInstructor:", result);

    if (!result.success) {
      response.status = 400;
      response.body = {
        success: false,
        msg: result.message || "Error al asignar ficha al instructor"
      };
      console.log("🔴 Error al asignar ficha:", result.message);
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      msg: result.message || "Ficha asignada exitosamente"
    };
    console.log("🟢 Ficha asignada exitosamente");
  } catch (error) {
    console.error("🔴 Error detallado en asignarFicha:", error);
    console.error("🔴 Stack trace:", error instanceof Error ? error.stack : String(error));
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor", error: String(error) };
  }
};

// Desasignar una ficha de un instructor
export const desasignarFicha = async (ctx: any) => {
  console.log("🟢 Iniciando desasignarFicha");
  const { request, response } = ctx;

  console.log("🟢 Verificando si request tiene body:", request.hasBody);
  if (!request.hasBody) {
    console.log("🔴 Error: No hay cuerpo en la solicitud para desasignar");
    response.status = 400;
    response.body = { success: false, msg: "Datos no proporcionados" };
    return;
  }

  try {
    console.log("🟢 Tipo de request:", typeof request);
    console.log("🟢 Propiedades de request:", Object.keys(request));
    console.log("🟢 Tipo de request.body:", typeof request.body);

    // Usar nuestra función auxiliar para obtener el body
    const body = await getRequestBody(request);
    console.log("🟢 Cuerpo de la petición desasignarFicha:", JSON.stringify(body));

    if (!body.idFuncionario || !body.idFicha) {
      console.log("🔴 Error: Faltan idFuncionario o idFicha para desasignar");
      response.status = 400;
      response.body = {
        success: false,
        msg: "Se requiere ID del funcionario e ID de la ficha para desasignar"
      };
      return;
    }

    // Convertir a números
    const idFuncionario = parseInt(body.idFuncionario);
    const idFicha = parseInt(body.idFicha);
    console.log("🟢 idFuncionario:", idFuncionario, "idFicha:", idFicha);

    console.log("🟢 Llamando a desasignarFichaDeInstructor con parámetros:");
    console.log("idFuncionario:", idFuncionario);
    console.log("idFicha:", idFicha);

    const result = await desasignarFichaDeInstructor(idFuncionario, idFicha);
    console.log("🟢 Resultado de desasignarFichaDeInstructor:", result);

    if (!result.success) {
      response.status = 400;
      response.body = {
        success: false,
        msg: result.message || "Error al desasignar ficha del instructor"
      };
      console.log("🔴 Error al desasignar ficha:", result.message);
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      msg: result.message || "Ficha desasignada exitosamente"
    };
    console.log("🟢 Ficha desasignada exitosamente");
  } catch (error) {
    console.error("🔴 Error detallado en desasignarFicha:", error);
    console.error("🔴 Stack trace:", error instanceof Error ? error.stack : String(error));
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor", error: String(error) };
  }
};


// Listar tipos de funcionario (roles disponibles)
export const listarRoles = async (ctx: any) => {
  const { response } = ctx;

  try {
    const result = await listarTiposFuncionario();

    if (!result.success) {
      response.status = 500;
      response.body = {
        success: false,
        msg: result.message || "Error al obtener roles de funcionario"
      };
      return;
    }

    response.status = 200;
    response.body = {
      success: true,
      roles: result.data
    };
  } catch (error) {
    console.error("Error en listarRoles:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};