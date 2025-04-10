// adminController.ts
import { 
  listarFuncionarios,
  obtenerFuncionarioPorId,
  crearFuncionario, 
  actualizarFuncionario, 
  eliminarFuncionario,
  buscarFuncionarios,
  Funcionario
} from "../Models/adminModels.ts";

export const getAdministradores = async (ctx: any) => {
  const { response } = ctx;
  
  try {
    const funcionarios = await listarFuncionarios();
    
    if (!funcionarios || funcionarios.length === 0) {
      response.status = 404;
      response.body = { 
        success: false, 
        message: "No se encontraron administradores" 
      };
      return;
    }
    
    // Mapear los datos de funcionarios al formato esperado por el frontend
    const administradores = funcionarios.map((func: any) => ({
      id_administrador: func.idfuncionario,
      nombre: func.nombres,
      apellido: func.apellidos,
      tipo_documento: func.tipo_documento,
      idtipo_documento: func.tipo_documento_idtipo_documento,
      documento: func.documento,
      telefono: func.telefono,
      email: func.email,
      rol: func.tipo_funcionario || "Administrador",
      imagen: func.url_imgfuncionario
    }));
    
    response.status = 200;
    response.body = {
      success: true,
      administradores
    };
  } catch (error) {
    console.error("Error en getAdministradores", error);
    response.status = 500;
    response.body = { 
      success: false, 
      message: "Error interno del servidor" 
    };
  }
};

export const getAdministradorPorId = async (ctx: any) => {
  const { response, params } = ctx;
  const id = params.id;
  
  if (!id) {
    response.status = 400;
    response.body = { 
      success: false, 
      message: "ID del administrador no proporcionado" 
    };
    return;
  }
  
  try {
    const funcionario = await obtenerFuncionarioPorId(Number(id));
    
    if (!funcionario) {
      response.status = 404;
      response.body = { 
        success: false, 
        message: "Administrador no encontrado" 
      };
      return;
    }
    
    // Mapear al formato esperado por el frontend
    const administrador = {
      id_administrador: funcionario.idfuncionario,
      nombre: funcionario.nombres,
      apellido: funcionario.apellidos,
      tipo_documento: funcionario.tipo_documento,
      idtipo_documento: funcionario.tipo_documento_idtipo_documento,
      documento: funcionario.documento,
      telefono: funcionario.telefono,
      email: funcionario.email,
      rol: funcionario.tipo_funcionario || "Administrador",
      imagen: funcionario.url_imgfuncionario
    };
    
    response.status = 200;
    response.body = {
      success: true,
      administrador
    };
  } catch (error) {
    console.error(`Error en getAdministradorPorId con ID ${id}`, error);
    response.status = 500;
    response.body = { 
      success: false, 
      message: "Error interno del servidor" 
    };
  }
};

export const buscarAdministrador = async (ctx: any) => {
  const { response, params } = ctx;
  const termino = params.termino;
  
  if (!termino) {
    response.status = 400;
    response.body = { 
      success: false, 
      message: "Término de búsqueda no proporcionado" 
    };
    return;
  }
  
  try {
    const funcionarios = await buscarFuncionarios(termino);
    
    if (!funcionarios || funcionarios.length === 0) {
      response.status = 404;
      response.body = { 
        success: false, 
        message: "No se encontraron administradores con ese término de búsqueda" 
      };
      return;
    }
    
    // Mapear al formato esperado por el frontend
    const administradores = funcionarios.map((func: any) => ({
      id_administrador: func.idfuncionario,
      nombre: func.nombres,
      apellido: func.apellidos,
      tipo_documento: func.tipo_documento,
      idtipo_documento: func.tipo_documento_idtipo_documento,
      documento: func.documento,
      telefono: func.telefono,
      email: func.email,
      rol: func.tipo_funcionario || "Administrador",
      imagen: func.url_imgfuncionario
    }));
    
    response.status = 200;
    response.body = {
      success: true,
      administradores
    };
  } catch (error) {
    console.error(`Error en buscarAdministrador con término ${termino}`, error);
    response.status = 500;
    response.body = { 
      success: false, 
      message: "Error interno del servidor" 
    };
  }
};

export const createAdministrador = async (ctx: any) => {
  const { request, response } = ctx;
  
  try {
    const contentLength = request.headers.get("Content-Length");
    if (!contentLength || contentLength === "0") {
      response.status = 400;
      response.body = {
        success: false,
        msg: "Cuerpo de la solicitud vacío",
      };
      return;
    }
    
    const body = await request.body.json();
    console.log("Datos Recibidos:", body);
    
    const {
      documento,
      nombres,
      apellidos,
      email,
      telefono,
      url_imgfuncionario,
      password,
      tipo_documento_idtipo_documento
    } = body;
    
    // Validar que los campos obligatorios estén presentes y sean válidos
    if (
      typeof documento !== "string" || 
      documento.trim() === "" ||
      typeof nombres !== "string" || 
      nombres.trim() === "" ||
      typeof apellidos !== "string" || 
      apellidos.trim() === "" ||
      typeof email !== "string" || 
      email.trim() === "" ||
      typeof telefono !== "string" || 
      telefono.trim() === "" ||
      typeof password !== "string" || 
      password.trim() === "" ||
      typeof tipo_documento_idtipo_documento !== "number" || 
      tipo_documento_idtipo_documento <= 0
    ) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "Datos inválidos. Verifique los campos enviados.",
      };
      return;
    }
    
    // La imagen puede ser opcional
    const imagenPath = url_imgfuncionario && typeof url_imgfuncionario === "string" ? url_imgfuncionario.trim() : "";
    
    const administradorData: Funcionario = {
      documento: documento.trim(),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      url_imgfuncionario: imagenPath,
      password: password,
      tipo_documento_idtipo_documento
    };
    
    const result = await crearFuncionario(administradorData);
    
    response.status = result.success ? 201 : 400;
    response.body = result;
  } catch (error) {
    console.error("Error en createAdministrador:", error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const updateAdministrador = async (ctx: any) => {
  const { request, response, params } = ctx;
  
  try {
    // Verificar que existe un ID en los parámetros
    if (!params || !params.id) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "Se requiere un ID de administrador para actualizar",
      };
      return;
    }
    
    const id = parseInt(params.id);
    if (isNaN(id) || id <= 0) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "ID de administrador inválido",
      };
      return;
    }
    
    const contentLength = request.headers.get("Content-Length");
    if (!contentLength || contentLength === "0") {
      response.status = 400;
      response.body = {
        success: false,
        msg: "Cuerpo de la solicitud vacío",
      };
      return;
    }
    
    const body = await request.body.json();
    console.log("Datos Recibidos para actualización:", body);
    
    const {
      documento,
      nombres,
      apellidos,
      email,
      telefono,
      url_imgfuncionario,
      password,
      tipo_documento_idtipo_documento
    } = body;
    
    // Validar que los campos requeridos estén presentes y sean válidos
    if (
      (!documento || typeof documento !== "string" || documento.trim() === "") &&
      (!nombres || typeof nombres !== "string" || nombres.trim() === "") &&
      (!apellidos || typeof apellidos !== "string" || apellidos.trim() === "") &&
      (!email || typeof email !== "string" || email.trim() === "") &&
      (!telefono || typeof telefono !== "string" || telefono.trim() === "") &&
      (!tipo_documento_idtipo_documento || typeof tipo_documento_idtipo_documento !== "number" || tipo_documento_idtipo_documento <= 0)
    ) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "Datos inválidos. Debe proporcionar al menos un campo para actualizar.",
      };
      return;
    }
    
    // Obtener el funcionario actual para mantener los campos que no se actualizan
    const funcionarioActual = await obtenerFuncionarioPorId(id);
    if (!funcionarioActual) {
      response.status = 404;
      response.body = {
        success: false,
        msg: "Administrador no encontrado",
      };
      return;
    }
    
    // Preparar los datos de actualización
    const administradorData: Funcionario = {
      documento: documento ? documento.trim() : funcionarioActual.documento,
      nombres: nombres ? nombres.trim() : funcionarioActual.nombres,
      apellidos: apellidos ? apellidos.trim() : funcionarioActual.apellidos,
      email: email ? email.trim() : funcionarioActual.email,
      telefono: telefono ? telefono.trim() : funcionarioActual.telefono,
      url_imgfuncionario: url_imgfuncionario ? url_imgfuncionario.trim() : funcionarioActual.url_imgfuncionario,
      password: password ? password : funcionarioActual.password,
      tipo_documento_idtipo_documento: tipo_documento_idtipo_documento || funcionarioActual.tipo_documento_idtipo_documento
    };
    
    const result = await actualizarFuncionario(id, administradorData);
    
    response.status = result.success ? 200 : 400;
    response.body = result;
  } catch (error) {
    console.error(`Error en updateAdministrador:`, error);
    response.status = 500;
    response.body = { success: false, msg: "Error interno del servidor" };
  }
};

export const deleteAdministrador = async (ctx: any) => {
  const { response, params } = ctx;
  const id = params.id;
  
  if (!id) {
    response.status = 400;
    response.body = { 
      success: false, 
      message: "ID del administrador no proporcionado" 
    };
    return;
  }
  
  try {
    const result = await eliminarFuncionario(Number(id));
    
    if (result.success) {
      response.status = 200;
      response.body = result;
    } else {
      response.status = result.message.includes("no encontrado") ? 404 : 400;
      response.body = result;
    }
  } catch (error) {
    console.error(`Error en deleteAdministrador con ID ${id}`, error);
    response.status = 500;
    response.body = { 
      success: false, 
      message: "Error interno del servidor" 
    };
  }
};