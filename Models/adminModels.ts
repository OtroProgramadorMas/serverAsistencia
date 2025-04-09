// adminModel.ts
import { Conexion } from "./conexion.ts";

export interface Administrador {
  id_administrador?: number;
  nombre: string;
  apellido: string;
  idtipo_documento: number;
  documento: string;
  telefono: string;
  email: string;
  password?: string;
  rol: string;
  imagen?: string;
}

export const listarAdministradores = async () => {
  try {
    const query = `
      SELECT a.id_administrador, a.nombre, a.apellido, a.idtipo_documento, 
             t.tipo_documento, a.documento, a.telefono, a.email, a.rol, a.imagen
      FROM administradores a
      JOIN tipo_documento t ON a.idtipo_documento = t.idtipo_documento
      ORDER BY a.id_administrador ASC
    `;
    const result = await Conexion.query(query);
    return result;
  } catch (error) {
    console.error("Error al listar administradores", error);
    return [];
  }
};

export const obtenerAdministradorPorId = async (id: number) => {
  try {
    const query = `
      SELECT a.id_administrador, a.nombre, a.apellido, a.idtipo_documento, 
             t.tipo_documento, a.documento, a.telefono, a.email, a.rol, a.imagen
      FROM administradores a
      JOIN tipo_documento t ON a.idtipo_documento = t.idtipo_documento
      WHERE a.id_administrador = ?
    `;
    const result = await Conexion.query(query, [id]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Error al obtener administrador con ID ${id}`, error);
    return null;
  }
};

export const crearAdministrador = async (admin: Administrador) => {
  try {
    // Verificar si el email ya existe
    const checkEmail = await Conexion.query(
      "SELECT id_administrador FROM administradores WHERE email = ?",
      [admin.email]
    );
    
    if (checkEmail.length > 0) {
      return { success: false, message: "El email ya está registrado" };
    }
    
    // Verificar si el documento ya existe
    const checkDocumento = await Conexion.query(
      "SELECT id_administrador FROM administradores WHERE documento = ? AND idtipo_documento = ?",
      [admin.documento, admin.idtipo_documento]
    );
    
    if (checkDocumento.length > 0) {
      return { success: false, message: "El documento ya está registrado" };
    }
    
    const query = `
      INSERT INTO administradores (
        nombre, apellido, idtipo_documento, documento, 
        telefono, email, password, rol, imagen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // En una aplicación real, deberías hashear la contraseña antes de guardarla
    // Por ejemplo: const hashedPassword = await bcrypt.hash(admin.password, 10);
    
    const result = await Conexion.query(query, [
      admin.nombre,
      admin.apellido,
      admin.idtipo_documento,
      admin.documento,
      admin.telefono,
      admin.email,
      admin.password || "defaultPassword", // En un caso real, sería el hash
      admin.rol,
      admin.imagen || null
    ]);
    
    if (result && result.affectedRows > 0) {
      return { 
        success: true, 
        message: "Administrador creado exitosamente", 
        id: result.insertId 
      };
    } else {
      return { success: false, message: "No se pudo crear el administrador" };
    }
  } catch (error) {
    console.error("Error al crear administrador", error);
    return { success: false, message: "Error al crear administrador" };
  }
};

export const actualizarAdministrador = async (id: number, admin: Administrador) => {
  try {
    // Verificar si existe el administrador
    const adminExistente = await obtenerAdministradorPorId(id);
    if (!adminExistente) {
      return { success: false, message: "Administrador no encontrado" };
    }
    
    // Verificar si el email ya está usado por otro administrador
    if (admin.email !== adminExistente.email) {
      const checkEmail = await Conexion.query(
        "SELECT id_administrador FROM administradores WHERE email = ? AND id_administrador != ?",
        [admin.email, id]
      );
      
      if (checkEmail.length > 0) {
        return { success: false, message: "El email ya está registrado por otro administrador" };
      }
    }
    
    // Verificar si el documento ya está usado por otro administrador
    if (admin.documento !== adminExistente.documento || 
        admin.idtipo_documento !== adminExistente.idtipo_documento) {
      const checkDocumento = await Conexion.query(
        "SELECT id_administrador FROM administradores WHERE documento = ? AND idtipo_documento = ? AND id_administrador != ?",
        [admin.documento, admin.idtipo_documento, id]
      );
      
      if (checkDocumento.length > 0) {
        return { success: false, message: "El documento ya está registrado por otro administrador" };
      }
    }
    
    let query = `
      UPDATE administradores SET 
        nombre = ?, 
        apellido = ?, 
        idtipo_documento = ?, 
        documento = ?, 
        telefono = ?, 
        email = ?, 
        rol = ?
    `;
    
    const params = [
      admin.nombre,
      admin.apellido,
      admin.idtipo_documento,
      admin.documento,
      admin.telefono,
      admin.email,
      admin.rol
    ];
    
    // Agregar imagen al update si se proporciona
    if (admin.imagen) {
      query += `, imagen = ?`;
      params.push(admin.imagen);
    }
    
    // Agregar contraseña al update si se proporciona
    if (admin.password) {
      query += `, password = ?`;
      // En una aplicación real, deberías hashear la contraseña
      // const hashedPassword = await bcrypt.hash(admin.password, 10);
      params.push(admin.password);
    }
    
    query += ` WHERE id_administrador = ?`;
    params.push(id);
    
    const result = await Conexion.query(query, params);
    
    if (result && result.affectedRows > 0) {
      return { success: true, message: "Administrador actualizado exitosamente" };
    } else {
      return { success: false, message: "No se pudo actualizar el administrador" };
    }
  } catch (error) {
    console.error(`Error al actualizar administrador con ID ${id}`, error);
    return { success: false, message: "Error al actualizar administrador" };
  }
};

export const eliminarAdministrador = async (id: number) => {
  try {
    // Verificar si existe el administrador
    const adminExistente = await obtenerAdministradorPorId(id);
    if (!adminExistente) {
      return { success: false, message: "Administrador no encontrado" };
    }
    
    const query = "DELETE FROM administradores WHERE id_administrador = ?";
    const result = await Conexion.query(query, [id]);
    
    if (result && result.affectedRows > 0) {
      return { success: true, message: "Administrador eliminado exitosamente" };
    } else {
      return { success: false, message: "No se pudo eliminar el administrador" };
    }
  } catch (error) {
    console.error(`Error al eliminar administrador con ID ${id}`, error);
    return { success: false, message: "Error al eliminar administrador" };
  }
};