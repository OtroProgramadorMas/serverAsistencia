// deno-lint-ignore-file no-explicit-any
import { 
  listarFuncionariosConRoles,
  listarFuncionariosPorRol,
  obtenerFuncionarioPorId,
  listarTiposFuncionario
} from "../Models/funcionarioModel.ts";

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