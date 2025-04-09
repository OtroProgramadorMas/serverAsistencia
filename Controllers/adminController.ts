// adminController.ts
import { 
    listarAdministradores, 
    obtenerAdministradorPorId, 
    crearAdministrador, 
    actualizarAdministrador, 
    eliminarAdministrador,
    Administrador
  } from "../Models/adminModels.ts";
  
  export const getAdministradores = async (ctx: any) => {
    const { response } = ctx;
    
    try {
      const administradores = await listarAdministradores();
      
      if (!administradores || administradores.length === 0) {
        response.status = 404;
        response.body = { 
          success: false, 
          message: "No se encontraron administradores" 
        };
        return;
      }
      
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
      const administrador = await obtenerAdministradorPorId(Number(id));
      
      if (!administrador) {
        response.status = 404;
        response.body = { 
          success: false, 
          message: "Administrador no encontrado" 
        };
        return;
      }
      
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
  
  export const createAdministrador = async (ctx: any) => {
    const { request, response } = ctx;
    
    if (!request.hasBody) {
      response.status = 400;
      response.body = { 
        success: false, 
        message: "Datos del administrador no proporcionados" 
      };
      return;
    }
    
    try {
      const body = await request.body().value;
      
      // Validar campos requeridos
      if (!body.nombre || !body.apellido || !body.idtipo_documento || 
          !body.documento || !body.telefono || !body.email || !body.rol) {
        response.status = 400;
        response.body = { 
          success: false, 
          message: "Todos los campos son requeridos" 
        };
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        response.status = 400;
        response.body = { 
          success: false, 
          message: "Formato de email inválido" 
        };
        return;
      }
      
      // Crear el administrador
      const administrador: Administrador = {
        nombre: body.nombre,
        apellido: body.apellido,
        idtipo_documento: Number(body.idtipo_documento),
        documento: body.documento,
        telefono: body.telefono,
        email: body.email,
        password: body.password,
        rol: body.rol,
        imagen: body.imagen
      };
      
      const result = await crearAdministrador(administrador);
      
      if (result.success) {
        response.status = 201;
        response.body = result;
      } else {
        response.status = 400;
        response.body = result;
      }
    } catch (error) {
      console.error("Error en createAdministrador", error);
      response.status = 500;
      response.body = { 
        success: false, 
        message: "Error interno del servidor" 
      };
    }
  };
  
  export const updateAdministrador = async (ctx: any) => {
    const { request, response, params } = ctx;
    const id = params.id;
    
    if (!id) {
      response.status = 400;
      response.body = { 
        success: false, 
        message: "ID del administrador no proporcionado" 
      };
      return;
    }
    
    if (!request.hasBody) {
      response.status = 400;
      response.body = { 
        success: false, 
        message: "Datos del administrador no proporcionados" 
      };
      return;
    }
    
    try {
      const body = await request.body().value;
      
      // Validar campos requeridos
      if (!body.nombre || !body.apellido || !body.idtipo_documento || 
          !body.documento || !body.telefono || !body.email || !body.rol) {
        response.status = 400;
        response.body = { 
          success: false, 
          message: "Todos los campos son requeridos" 
        };
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        response.status = 400;
        response.body = { 
          success: false, 
          message: "Formato de email inválido" 
        };
        return;
      }
      
      // Actualizar el administrador
      const administrador: Administrador = {
        nombre: body.nombre,
        apellido: body.apellido,
        idtipo_documento: Number(body.idtipo_documento),
        documento: body.documento,
        telefono: body.telefono,
        email: body.email,
        rol: body.rol
      };
      
      // Agregar password e imagen solo si se proporcionan
      if (body.password) {
        administrador.password = body.password;
      }
      
      if (body.imagen) {
        administrador.imagen = body.imagen;
      }
      
      const result = await actualizarAdministrador(Number(id), administrador);
      
      if (result.success) {
        response.status = 200;
        response.body = result;
      } else {
        response.status = result.message.includes("no encontrado") ? 404 : 400;
        response.body = result;
      }
    } catch (error) {
      console.error(`Error en updateAdministrador con ID ${id}`, error);
      response.status = 500;
      response.body = { 
        success: false, 
        message: "Error interno del servidor" 
      };
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
      const result = await eliminarAdministrador(Number(id));
      
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