// funcionarioModel.ts
import { Conexion } from "./conexion.ts";

export interface Funcionario {
  idfuncionario?: number;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgfuncionario?: string;
  password: string;
  tipo_documento_idtipo_documento: number;
}

export const listarFuncionarios = async () => {
  try {
    const query = `
  SELECT f.idfuncionario, f.documento, f.nombres, f.apellidos, 
         f.email, f.telefono, f.url_imgfuncionario, td.tipo_documento,
         tf.tipo_funcionario, f.tipo_documento_idtipo_documento
  FROM funcionario f
  LEFT JOIN tipo_documento td ON f.tipo_documento_idtipo_documento = td.idtipo_documento
  INNER JOIN funcionario_has_tipo_funcionario fhtf ON f.idfuncionario = fhtf.funcionario_idfuncionario
  INNER JOIN tipo_funcionario tf ON fhtf.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
  WHERE tf.idtipo_funcionario = 1
  ORDER BY f.idfuncionario ASC
`;
    const result = await Conexion.query(query);
    return result;
  } catch (error) {
    console.error("Error al listar funcionarios", error);
    return [];
  }
};
export const obtenerNuevoIdFuncionario = async () => {
  try {
    const query = `
      SELECT MAX(idfuncionario) AS maximo_id
      FROM funcionario
    `;
    const result = await Conexion.query(query);
    const maximoId = result[0].maximo_id || 0;
    const nuevoId = maximoId + 1;
    
    console.log("Nuevo ID de funcionario disponible:", nuevoId);
    
    return nuevoId;
  } catch (error) {
    console.error("Error al obtener nuevo ID de funcionario", error);
    throw error;
  }
};

export const obtenerFuncionarioPorId = async (id: number) => {
  try {
    const query = `
      SELECT f.idfuncionario, f.documento, f.nombres, f.apellidos, 
             f.email, f.telefono, f.url_imgfuncionario, f.tipo_documento_idtipo_documento,
             td.tipo_documento, tf.tipo_funcionario, tf.idtipo_funcionario
      FROM funcionario f
      JOIN tipo_documento td ON f.tipo_documento_idtipo_documento = td.idtipo_documento
      JOIN funcionario_has_tipo_funcionario fhtf ON f.idfuncionario = fhtf.funcionario_idfuncionario
      JOIN tipo_funcionario tf ON fhtf.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
      WHERE f.idfuncionario = ?
    `;
    const result = await Conexion.query(query, [id]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Error al obtener funcionario con ID ${id}`, error);
    return null;
  }
};

export const crearFuncionario = async (funcionario: Funcionario) => {
  try {
    // Iniciar transacción
    await Conexion.query("START TRANSACTION");
    
    // Verificar si el email ya existe
    const checkEmail = await Conexion.query(
      "SELECT idfuncionario FROM funcionario WHERE email = ?",
      [funcionario.email]
    );
    
    if (checkEmail.length > 0) {
      await Conexion.query("ROLLBACK");
      return { success: false, message: "El email ya está registrado" };
    }
    
    // Verificar si el documento ya existe
    const checkDocumento = await Conexion.query(
      "SELECT idfuncionario FROM funcionario WHERE documento = ? AND tipo_documento_idtipo_documento = ?",
      [funcionario.documento, funcionario.tipo_documento_idtipo_documento]
    );
    
    if (checkDocumento.length > 0) {
      await Conexion.query("ROLLBACK");
      return { success: false, message: "El documento ya está registrado" };
    }
    
    // Obtener el nuevo ID de funcionario
    const nuevoId = await obtenerNuevoIdFuncionario();
    
    // Insertar en la tabla funcionario con el ID específico
    const query = `
      INSERT INTO funcionario (
        idfuncionario, documento, nombres, apellidos, email, telefono, 
        url_imgfuncionario, password, tipo_documento_idtipo_documento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // En una aplicación real, deberías hashear la contraseña antes de guardarla
    
    const result = await Conexion.query(query, [
      nuevoId,
      funcionario.documento,
      funcionario.nombres,
      funcionario.apellidos,
      funcionario.email,
      funcionario.telefono,
      funcionario.url_imgfuncionario || null,
      funcionario.password,
      funcionario.tipo_documento_idtipo_documento
    ]);
    
    if (result && result.affectedRows > 0) {
      // Insertar en la tabla funcionario_has_tipo_funcionario con el mismo ID y password
      const relacionQuery = `
        INSERT INTO funcionario_has_tipo_funcionario (
          funcionario_idfuncionario, tipo_funcionario_idtipo_funcionario, password
        ) VALUES (?, 1, ?)
      `;
      
      const relacionResult = await Conexion.query(relacionQuery, [nuevoId, funcionario.password]);
      
      if (relacionResult && relacionResult.affectedRows > 0) {
        await Conexion.query("COMMIT");
        return { 
          success: true, 
          message: "Funcionario creado exitosamente", 
          id: nuevoId 
        };
      } else {
        await Conexion.query("ROLLBACK");
        return { success: false, message: "No se pudo crear la relación de tipo de funcionario" };
      }
    } else {
      await Conexion.query("ROLLBACK");
      return { success: false, message: "No se pudo crear el funcionario" };
    }
  } catch (error) {
    await Conexion.query("ROLLBACK");
    console.error("Error al crear funcionario", error);
    return { success: false, message: "Error al crear funcionario" };
  }
};
export const actualizarFuncionario = async (id: number, funcionario: Funcionario) => {
  try {
    // Iniciar transacción
    await Conexion.query("START TRANSACTION");
    
    // Verificar si existe el funcionario
    const funcionarioExistente = await obtenerFuncionarioPorId(id);
    if (!funcionarioExistente) {
      await Conexion.query("ROLLBACK");
      return { success: false, message: "Funcionario no encontrado" };
    }
    
    // Verificar si el email ya está usado por otro funcionario
    if (funcionario.email !== funcionarioExistente.email) {
      const checkEmail = await Conexion.query(
        "SELECT idfuncionario FROM funcionario WHERE email = ? AND idfuncionario != ?",
        [funcionario.email, id]
      );
      
      if (checkEmail.length > 0) {
        await Conexion.query("ROLLBACK");
        return { success: false, message: "El email ya está registrado por otro funcionario" };
      }
    }
    
    // Verificar si el documento ya está usado por otro funcionario
    if (funcionario.documento !== funcionarioExistente.documento || 
        funcionario.tipo_documento_idtipo_documento !== funcionarioExistente.tipo_documento_idtipo_documento) {
      const checkDocumento = await Conexion.query(
        "SELECT idfuncionario FROM funcionario WHERE documento = ? AND tipo_documento_idtipo_documento = ? AND idfuncionario != ?",
        [funcionario.documento, funcionario.tipo_documento_idtipo_documento, id]
      );
      
      if (checkDocumento.length > 0) {
        await Conexion.query("ROLLBACK");
        return { success: false, message: "El documento ya está registrado por otro funcionario" };
      }
    }
    
    let query = `
      UPDATE funcionario SET 
        documento = ?, 
        nombres = ?, 
        apellidos = ?, 
        email = ?, 
        telefono = ?, 
        tipo_documento_idtipo_documento = ?
    `;
    
    const params = [
      funcionario.documento,
      funcionario.nombres,
      funcionario.apellidos,
      funcionario.email,
      funcionario.telefono,
      funcionario.tipo_documento_idtipo_documento
    ];
    
    // Agregar imagen al update si se proporciona
    if (funcionario.url_imgfuncionario) {
      query += `, url_imgfuncionario = ?`;
      params.push(funcionario.url_imgfuncionario);
    }
    
    // Agregar contraseña al update si se proporciona
    if (funcionario.password) {
      query += `, password = ?`;
      // En una aplicación real, deberías hashear la contraseña
      // const hashedPassword = await bcrypt.hash(funcionario.password, 10);
      params.push(funcionario.password);
    }
    
    query += ` WHERE idfuncionario = ?`;
    params.push(id);
    
    const result = await Conexion.query(query, params);
    
    // Comprobar si existe la relación en funcionario_has_tipo_funcionario
    const checkRelacion = await Conexion.query(
      "SELECT * FROM funcionario_has_tipo_funcionario WHERE funcionario_idfuncionario = ?",
      [id]
    );
    
    // Si no existe la relación, crearla
    if (checkRelacion.length === 0) {
      const relacionQuery = `
        INSERT INTO funcionario_has_tipo_funcionario (
          funcionario_idfuncionario, tipo_funcionario_idtipo_funcionario
        ) VALUES (?, 1)
      `;
      
      await Conexion.query(relacionQuery, [id]);
    }
    
    await Conexion.query("COMMIT");
    
    if (result && result.affectedRows > 0) {
      return { success: true, message: "Funcionario actualizado exitosamente" };
    } else {
      return { success: false, message: "No se pudo actualizar el funcionario" };
    }
  } catch (error) {
    await Conexion.query("ROLLBACK");
    console.error(`Error al actualizar funcionario con ID ${id}`, error);
    return { success: false, message: "Error al actualizar funcionario" };
  }
};

export const eliminarFuncionario = async (id: number) => {
  try {
    // Iniciar transacción
    await Conexion.query("START TRANSACTION");
    
    // Verificar si existe el funcionario
    const funcionarioExistente = await obtenerFuncionarioPorId(id);
    if (!funcionarioExistente) {
      await Conexion.query("ROLLBACK");
      return { success: false, message: "Funcionario no encontrado" };
    }
    
    // Eliminar registros de la tabla de relación primero
    const deleteRelacionQuery = "DELETE FROM funcionario_has_tipo_funcionario WHERE funcionario_idfuncionario = ?";
    await Conexion.query(deleteRelacionQuery, [id]);
    
    // Eliminar el funcionario
    const deleteQuery = "DELETE FROM funcionario WHERE idfuncionario = ?";
    const result = await Conexion.query(deleteQuery, [id]);
    
    await Conexion.query("COMMIT");
    
    if (result && result.affectedRows > 0) {
      return { success: true, message: "Funcionario eliminado exitosamente" };
    } else {
      return { success: false, message: "No se pudo eliminar el funcionario" };
    }
  } catch (error) {
    await Conexion.query("ROLLBACK");
    console.error(`Error al eliminar funcionario con ID ${id}`, error);
    return { success: false, message: "Error al eliminar funcionario" };
  }
};

// Función para buscar funcionarios por documento, nombre o apellido
export const buscarFuncionarios = async (termino: string) => {
  try {
    const query = `
      SELECT f.idfuncionario, f.documento, f.nombres, f.apellidos, 
             f.email, f.telefono, f.url_imgfuncionario, td.tipo_documento,
             tf.tipo_funcionario
      FROM funcionario f
      JOIN tipo_documento td ON f.tipo_documento_idtipo_documento = td.idtipo_documento
      JOIN funcionario_has_tipo_funcionario fhtf ON f.idfuncionario = fhtf.funcionario_idfuncionario
      JOIN tipo_funcionario tf ON fhtf.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
      WHERE f.documento LIKE ? OR f.nombres LIKE ? OR f.apellidos LIKE ?
      ORDER BY f.idfuncionario ASC
    `;
    
    const terminoBusqueda = `%${termino}%`;
    const result = await Conexion.query(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda]);
    
    return result;
  } catch (error) {
    console.error("Error al buscar funcionarios", error);
    return [];
  }
};