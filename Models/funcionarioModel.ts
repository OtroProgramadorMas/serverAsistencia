import { Conexion } from "./conexion.ts";

export interface Funcionario {
  idFuncionario?: number | null;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario?: string | null;
  password?: string;
  tipo_documento_idtipo_documento: number;
}

export interface FuncionarioConRoles {
  idFuncionario: number;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario: string | null;
  password?: string;
  tipo_documento_idtipo_documento: number;
  tipo_documento?: string;
  abreviatura_tipo_documento?: string;
  roles: {
    idtipo_funcionario: number;
    tipo_funcionario: string;
    password?: string;
  }[];
  fichas?: {
    idficha: number;
    codigo_ficha: string;
    nombre_programa?: string;
  }[];
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

// Obtener todos los funcionarios con sus roles
export const listarFuncionariosConRoles = async (): Promise<ServiceResponse<FuncionarioConRoles[]>> => {
  try {
    const query = `
      SELECT 
        f.idFuncionario,
        f.documento,
        f.nombres,
        f.apellidos,
        f.email,
        f.telefono,
        f.url_imgFuncionario,
        f.tipo_documento_idtipo_documento,
        td.tipo_documento,
        td.abreviatura_tipo_documento,
        tf.idtipo_funcionario,
        tf.tipo_funcionario,
        ft.password as rol_password
      FROM funcionario f
      INNER JOIN tipo_documento td ON f.tipo_documento_idtipo_documento = td.idtipo_documento
      INNER JOIN funcionario_has_tipo_funcionario ft ON f.idFuncionario = ft.funcionario_idfuncionario
      INNER JOIN tipo_funcionario tf ON ft.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
      ORDER BY f.idFuncionario
    `;

    const result = await Conexion.query(query);

    // Transformar resultados planos en estructura jerárquica con roles
    const funcionariosMap = new Map<number, FuncionarioConRoles>();

    for (const row of result) {
      if (!funcionariosMap.has(row.idFuncionario)) {
        // Crear nuevo funcionario si no existe en el mapa
        funcionariosMap.set(row.idFuncionario, {
          idFuncionario: row.idFuncionario,
          documento: row.documento,
          nombres: row.nombres,
          apellidos: row.apellidos,
          email: row.email,
          telefono: row.telefono,
          url_imgFuncionario: row.url_imgFuncionario,
          password: row.password,
          tipo_documento_idtipo_documento: row.tipo_documento_idtipo_documento,
          tipo_documento: row.tipo_documento,
          abreviatura_tipo_documento: row.abreviatura_tipo_documento,
          roles: [],
          fichas: []
        });
      }

      // Agregar rol al funcionario
      const funcionario = funcionariosMap.get(row.idFuncionario);
      if (funcionario) {
        // Evitar duplicados de roles
        if (!funcionario.roles.some(r => r.idtipo_funcionario === row.idtipo_funcionario)) {
          funcionario.roles.push({
            idtipo_funcionario: row.idtipo_funcionario,
            tipo_funcionario: row.tipo_funcionario,
            password: row.rol_password
          });
        }
      }
    }

    // Cargar fichas para instructores
    for (const funcionario of funcionariosMap.values()) {
      // Verificar si es instructor (asumiendo que el ID de tipo_funcionario para instructor es 2)
      if (funcionario.roles.some(r => r.tipo_funcionario === 'instructor')) {
        const fichasQuery = `
          SELECT 
            f.idficha, 
            f.codigo_ficha,
            p.nombre_programa
          FROM funcionario_has_ficha fhf
          INNER JOIN ficha f ON fhf.ficha_idficha = f.idficha
          INNER JOIN programa p ON f.programa_idprograma = p.idprograma
          WHERE fhf.funcionario_idfuncionario = ?
        `;

        const fichasResult = await Conexion.query(fichasQuery, [funcionario.idFuncionario]);
        funcionario.fichas = fichasResult;
      }
    }

    return {
      success: true,
      data: Array.from(funcionariosMap.values())
    };
  } catch (error) {
    console.error("Error al listar funcionarios con roles:", error);
    return {
      success: false,
      message: "Error al obtener funcionarios con roles",
      error
    };
  }
};

// Obtener funcionarios por rol específico
export const listarFuncionariosPorRol = async (nombreRol: string): Promise<ServiceResponse<FuncionarioConRoles[]>> => {
  try {
    const query = `
      SELECT 
        f.idFuncionario,
        f.documento,
        f.nombres,
        f.apellidos,
        f.email,
        f.telefono,
        f.url_imgFuncionario,
        f.tipo_documento_idtipo_documento,
        td.tipo_documento,
        td.abreviatura_tipo_documento,
        tf.idtipo_funcionario,
        tf.tipo_funcionario,
        ft.password as rol_password
      FROM funcionario f
      INNER JOIN tipo_documento td ON f.tipo_documento_idtipo_documento = td.idtipo_documento
      INNER JOIN funcionario_has_tipo_funcionario ft ON f.idFuncionario = ft.funcionario_idfuncionario
      INNER JOIN tipo_funcionario tf ON ft.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
      WHERE tf.tipo_funcionario = ?
      ORDER BY f.idFuncionario
    `;

    const result = await Conexion.query(query, [nombreRol]);

    // Transformar resultados
    const funcionariosMap = new Map<number, FuncionarioConRoles>();

    for (const row of result) {
      if (!funcionariosMap.has(row.idFuncionario)) {
        funcionariosMap.set(row.idFuncionario, {
          idFuncionario: row.idFuncionario,
          documento: row.documento,
          nombres: row.nombres,
          apellidos: row.apellidos,
          email: row.email,
          telefono: row.telefono,
          url_imgFuncionario: row.url_imgFuncionario,
          password: row.password,
          tipo_documento_idtipo_documento: row.tipo_documento_idtipo_documento,
          tipo_documento: row.tipo_documento,
          abreviatura_tipo_documento: row.abreviatura_tipo_documento,
          roles: [],
          fichas: []
        });
      }

      const funcionario = funcionariosMap.get(row.idFuncionario);
      if (funcionario) {
        if (!funcionario.roles.some(r => r.idtipo_funcionario === row.idtipo_funcionario)) {
          funcionario.roles.push({
            idtipo_funcionario: row.idtipo_funcionario,
            tipo_funcionario: row.tipo_funcionario,
            password: row.rol_password
          });
        }
      }
    }

    // Cargar fichas para instructores
    if (nombreRol === 'instructor') {
      for (const funcionario of funcionariosMap.values()) {
        const fichasQuery = `
          SELECT 
            f.idficha, 
            f.codigo_ficha,
            p.nombre_programa
          FROM funcionario_has_ficha fhf
          INNER JOIN ficha f ON fhf.ficha_idficha = f.idficha
          INNER JOIN programa p ON f.programa_idprograma = p.idprograma
          WHERE fhf.funcionario_idfuncionario = ?
        `;

        const fichasResult = await Conexion.query(fichasQuery, [funcionario.idFuncionario]);
        funcionario.fichas = fichasResult;
      }
    }

    return {
      success: true,
      data: Array.from(funcionariosMap.values())
    };
  } catch (error) {
    console.error(`Error al listar funcionarios con rol ${nombreRol}:`, error);
    return {
      success: false,
      message: `Error al obtener funcionarios con rol ${nombreRol}`,
      error
    };
  }
};

// Obtener un funcionario por ID con todos sus roles
export const obtenerFuncionarioPorId = async (id: number): Promise<ServiceResponse<FuncionarioConRoles>> => {
  try {
    const query = `
      SELECT 
        f.idFuncionario,
        f.documento,
        f.nombres,
        f.apellidos,
        f.email,
        f.telefono,
        f.url_imgFuncionario,
        f.tipo_documento_idtipo_documento,
        td.tipo_documento,
        td.abreviatura_tipo_documento,
        tf.idtipo_funcionario,
        tf.tipo_funcionario,
        ft.password as rol_password
      FROM funcionario f
      INNER JOIN tipo_documento td ON f.tipo_documento_idtipo_documento = td.idtipo_documento
      INNER JOIN funcionario_has_tipo_funcionario ft ON f.idFuncionario = ft.funcionario_idfuncionario
      INNER JOIN tipo_funcionario tf ON ft.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
      WHERE f.idFuncionario = ?
    `;

    const result = await Conexion.query(query, [id]);

    if (result.length === 0) {
      return {
        success: false,
        message: "Funcionario no encontrado"
      };
    }

    // Construir el objeto funcionario con sus roles
    const funcionario: FuncionarioConRoles = {
      idFuncionario: result[0].idFuncionario,
      documento: result[0].documento,
      nombres: result[0].nombres,
      apellidos: result[0].apellidos,
      email: result[0].email,
      telefono: result[0].telefono,
      url_imgFuncionario: result[0].url_imgFuncionario,
      password: result[0].password,
      tipo_documento_idtipo_documento: result[0].tipo_documento_idtipo_documento,
      tipo_documento: result[0].tipo_documento,
      abreviatura_tipo_documento: result[0].abreviatura_tipo_documento,
      roles: [],
      fichas: []
    };

    // Agregar roles
    for (const row of result) {
      if (!funcionario.roles.some(r => r.idtipo_funcionario === row.idtipo_funcionario)) {
        funcionario.roles.push({
          idtipo_funcionario: row.idtipo_funcionario,
          tipo_funcionario: row.tipo_funcionario,
          password: row.rol_password
        });
      }
    }

    // Verificar si es instructor para cargar fichas
    if (funcionario.roles.some(r => r.tipo_funcionario === 'instructor')) {
      const fichasQuery = `
        SELECT 
          f.idficha, 
          f.codigo_ficha,
          p.nombre_programa
        FROM funcionario_has_ficha fhf
        INNER JOIN ficha f ON fhf.ficha_idficha = f.idficha
        INNER JOIN programa p ON f.programa_idprograma = p.idprograma
        WHERE fhf.funcionario_idfuncionario = ?
      `;

      const fichasResult = await Conexion.query(fichasQuery, [id]);
      funcionario.fichas = fichasResult;
    }

    return {
      success: true,
      data: funcionario
    };
  } catch (error) {
    console.error(`Error al obtener funcionario con ID ${id}:`, error);
    return {
      success: false,
      message: "Error al obtener funcionario",
      error
    };
  }
};

export const obtenerIdInstructorPorDocumento = async (documento: string): Promise<ServiceResponse<number>> => {
  try {
    // Limpiar el documento de caracteres no deseados
    const documentoLimpio = documento.replace(/[^0-9]/g, '');
    
    console.log('Documento original:', documento);
    console.log('Documento limpio:', documentoLimpio);

    const query = `
      SELECT f.idFuncionario
      FROM funcionario f
      INNER JOIN funcionario_has_tipo_funcionario ft ON f.idFuncionario = ft.funcionario_idfuncionario
      INNER JOIN tipo_funcionario tf ON ft.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
      WHERE tf.tipo_funcionario = 'instructor' AND f.documento = ?
    `;

    const rows = await Conexion.query(query, [documentoLimpio]);

    if (rows && rows.length > 0) {
      console.log('Resultado encontrado:', rows[0]);
      return {
        success: true,
        data: rows[0].idFuncionario
      };
    }

    return {
      success: false,
      message: 'No se encontró un instructor con ese documento'
    };
  } catch (error) {
    console.error(`Error al obtener ID del instructor con documento ${documento}:`, error);
    return {
      success: false,
      message: 'Error al buscar el ID del instructor',
      error
    };
  }
};


// Crear nuevo funcionario con roles y asignación de ficha
export const crearFuncionarioConRoles = async (
  funcionario: Funcionario,
  roles: { idRol: number, password: string }[],
  fichas?: number[]
): Promise<ServiceResponse<number>> => {
  try {
    // Iniciar transacción
    await Conexion.query('START TRANSACTION');

    // Verificar si el email ya existe
    const checkEmail = await Conexion.query(
      "SELECT idFuncionario FROM funcionario WHERE email = ?",
      [funcionario.email]
    );

    if (checkEmail.length > 0) {
      await Conexion.query('ROLLBACK');
      return {
        success: false,
        message: "El email ya está registrado"
      };
    }

    // Verificar si el documento ya existe
    const checkDocumento = await Conexion.query(
      "SELECT idFuncionario FROM funcionario WHERE documento = ? AND tipo_documento_idtipo_documento = ?",
      [funcionario.documento, funcionario.tipo_documento_idtipo_documento]
    );

    if (checkDocumento.length > 0) {
      await Conexion.query('ROLLBACK');
      return {
        success: false,
        message: "El documento ya está registrado"
      };
    }

    // Obtener el siguiente ID disponible
    const maxIdResult = await Conexion.query("SELECT MAX(idFuncionario) as maxId FROM funcionario");
    const nuevoId = maxIdResult[0].maxId ? maxIdResult[0].maxId + 1 : 1;

    // Insertar funcionario con ID explícito
    const insertQuery = `
      INSERT INTO funcionario (
        idFuncionario, documento, nombres, apellidos, email, telefono, 
        url_imgFuncionario, tipo_documento_idtipo_documento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await Conexion.query(insertQuery, [
      nuevoId,
      funcionario.documento,
      funcionario.nombres,
      funcionario.apellidos,
      funcionario.email,
      funcionario.telefono,
      funcionario.url_imgFuncionario || null,
      funcionario.tipo_documento_idtipo_documento
    ]);

    // Insertar roles
    if (roles.length === 0) {
      await Conexion.query('ROLLBACK');
      return {
        success: false,
        message: "Debe asignar al menos un rol al funcionario"
      };
    }

    for (const rol of roles) {
      const insertRolQuery = `
        INSERT INTO funcionario_has_tipo_funcionario (
          funcionario_idfuncionario, tipo_funcionario_idtipo_funcionario, password
        ) VALUES (?, ?, ?)
      `;

      await Conexion.query(insertRolQuery, [
        nuevoId,
        rol.idRol,
        rol.password
      ]);
    }

    // Asignar fichas si es instructor y se proporcionaron fichas
    if (fichas && fichas.length > 0) {
      const fichasIds = [];
      for (const fichaValue of fichas) {
        // Si el valor parece ser un código de ficha (mayor a 100000 por ejemplo)
        // Ajusta este número según tus códigos de ficha
        if (fichaValue > 100000) {
          // Buscar el ID correspondiente al código
          const fichaQuery = "SELECT idficha FROM ficha WHERE codigo_ficha = ?";
          const fichaResult = await Conexion.query(fichaQuery, [fichaValue.toString()]);

          if (fichaResult.length > 0) {
            fichasIds.push(fichaResult[0].idficha);
          } else {
            await Conexion.query('ROLLBACK');
            return {
              success: false,
              message: `La ficha con código ${fichaValue} no existe`
            };
          }
        } else {
          // Si parece ser un ID, usarlo directamente
          fichasIds.push(fichaValue);
        }
      }

      // Insertar las fichas con los IDs correctos
      for (const idFicha of fichasIds) {
        const insertFichaQuery = `
          INSERT INTO funcionario_has_ficha (
            funcionario_idfuncionario, ficha_idficha
          ) VALUES (?, ?)
        `;

        await Conexion.query(insertFichaQuery, [nuevoId, idFicha]);
      }
    }

    await Conexion.query('COMMIT');

    return {
      success: true,
      message: "Funcionario creado exitosamente",
      data: nuevoId
    };
  } catch (error) {
    await Conexion.query('ROLLBACK');
    console.error("Error al crear funcionario:", error);
    return {
      success: false,
      message: "Error al crear funcionario",
      error
    };
  }
};

// Actualizar funcionario y sus roles
export const actualizarFuncionarioConRoles = async (
  id: number,
  funcionario: Partial<Funcionario>,
  roles?: { idRol: number, password: string }[],
  fichas?: number[]
): Promise<ServiceResponse<void>> => {
  try {
    // Iniciar transacción
    await Conexion.query('START TRANSACTION');

    // Verificar si el funcionario existe
    const checkFuncionario = await Conexion.query(
      "SELECT idFuncionario FROM funcionario WHERE idFuncionario = ?",
      [id]
    );

    if (checkFuncionario.length === 0) {
      await Conexion.query('ROLLBACK');
      return {
        success: false,
        message: "El funcionario no existe"
      };
    }

    // Verificar email único (si se va a actualizar)
    if (funcionario.email) {
      const checkEmail = await Conexion.query(
        "SELECT idFuncionario FROM funcionario WHERE email = ? AND idFuncionario != ?",
        [funcionario.email, id]
      );

      if (checkEmail.length > 0) {
        await Conexion.query('ROLLBACK');
        return {
          success: false,
          message: "El email ya está registrado por otro funcionario"
        };
      }
    }

    // Verificar documento único (si se va a actualizar)
    if (funcionario.documento && funcionario.tipo_documento_idtipo_documento) {
      const checkDocumento = await Conexion.query(
        "SELECT idFuncionario FROM funcionario WHERE documento = ? AND tipo_documento_idtipo_documento = ? AND idFuncionario != ?",
        [funcionario.documento, funcionario.tipo_documento_idtipo_documento, id]
      );

      if (checkDocumento.length > 0) {
        await Conexion.query('ROLLBACK');
        return {
          success: false,
          message: "El documento ya está registrado por otro funcionario"
        };
      }
    }

    // Construir consulta de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (funcionario.documento) {
      updateFields.push("documento = ?");
      updateValues.push(funcionario.documento);
    }

    if (funcionario.nombres) {
      updateFields.push("nombres = ?");
      updateValues.push(funcionario.nombres);
    }

    if (funcionario.apellidos) {
      updateFields.push("apellidos = ?");
      updateValues.push(funcionario.apellidos);
    }

    if (funcionario.email) {
      updateFields.push("email = ?");
      updateValues.push(funcionario.email);
    }

    if (funcionario.telefono) {
      updateFields.push("telefono = ?");
      updateValues.push(funcionario.telefono);
    }

    if (funcionario.url_imgFuncionario !== undefined) {
      updateFields.push("url_imgFuncionario = ?");
      updateValues.push(funcionario.url_imgFuncionario);
    }

    if (funcionario.tipo_documento_idtipo_documento) {
      updateFields.push("tipo_documento_idtipo_documento = ?");
      updateValues.push(funcionario.tipo_documento_idtipo_documento);
    }

    // Actualizar datos básicos del funcionario si hay cambios
    if (updateFields.length > 0) {
      const updateQuery = `UPDATE funcionario SET ${updateFields.join(', ')} WHERE idFuncionario = ?`;
      updateValues.push(id);

      await Conexion.query(updateQuery, updateValues);
    }

    // Actualizar roles si se proporcionaron
    if (roles && roles.length > 0) {
      // Eliminar roles actuales
      await Conexion.query(
        "DELETE FROM funcionario_has_tipo_funcionario WHERE funcionario_idfuncionario = ?",
        [id]
      );

      // Insertar nuevos roles
      for (const rol of roles) {
        const insertRolQuery = `
          INSERT INTO funcionario_has_tipo_funcionario (
            funcionario_idfuncionario, tipo_funcionario_idtipo_funcionario, password
          ) VALUES (?, ?, ?)
        `;

        await Conexion.query(insertRolQuery, [
          id,
          rol.idRol,
          rol.password
        ]);
      }
    }

    // Actualizar fichas asignadas si se proporcionaron
    if (fichas !== undefined) {
      // Eliminar asignaciones actuales
      await Conexion.query(
        "DELETE FROM funcionario_has_ficha WHERE funcionario_idfuncionario = ?",
        [id]
      );

      // Insertar nuevas asignaciones
      if (fichas.length > 0) {
        for (const idFicha of fichas) {
          const insertFichaQuery = `
            INSERT INTO funcionario_has_ficha (
              funcionario_idfuncionario, ficha_idficha
            ) VALUES (?, ?)
          `;

          await Conexion.query(insertFichaQuery, [id, idFicha]);
        }
      }
    }

    await Conexion.query('COMMIT');

    return {
      success: true,
      message: "Funcionario actualizado exitosamente"
    };
  } catch (error) {
    await Conexion.query('ROLLBACK');
    console.error(`Error al actualizar funcionario con ID ${id}:`, error);
    return {
      success: false,
      message: "Error al actualizar funcionario",
      error
    };
  }
};

// Eliminar funcionario
export const eliminarFuncionario = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Iniciar transacción
    await Conexion.query('START TRANSACTION');

    // Verificar si el funcionario existe
    const checkFuncionario = await Conexion.query(
      "SELECT idFuncionario FROM funcionario WHERE idFuncionario = ?",
      [id]
    );

    if (checkFuncionario.length === 0) {
      await Conexion.query('ROLLBACK');
      return {
        success: false,
        message: "El funcionario no existe"
      };
    }

    // Eliminar relaciones funcionario_has_tipo_funcionario
    await Conexion.query(
      "DELETE FROM funcionario_has_tipo_funcionario WHERE funcionario_idfuncionario = ?",
      [id]
    );

    // Eliminar relaciones funcionario_has_ficha
    await Conexion.query(
      "DELETE FROM funcionario_has_ficha WHERE funcionario_idfuncionario = ?",
      [id]
    );

    // Eliminar funcionario
    await Conexion.query(
      "DELETE FROM funcionario WHERE idFuncionario = ?",
      [id]
    );

    await Conexion.query('COMMIT');

    return {
      success: true,
      message: "Funcionario eliminado exitosamente"
    };
  } catch (error) {
    await Conexion.query('ROLLBACK');
    console.error(`Error al eliminar funcionario con ID ${id}:`, error);
    return {
      success: false,
      message: "Error al eliminar funcionario",
      error
    };
  }
};

// Asignar ficha a instructor
export const asignarFichaAInstructor = async (
  idFuncionario: number,
  idFicha: number
): Promise<ServiceResponse<void>> => {
  try {

console.log("func id" +idFuncionario + ", ficha id" + idFicha)

    // Verificar si el funcionario es instructor
    const checkInstructor = await Conexion.query(`
      SELECT ft.funcionario_idfuncionario
      FROM funcionario_has_tipo_funcionario ft
      INNER JOIN tipo_funcionario tf ON ft.tipo_funcionario_idtipo_funcionario = tf.idtipo_funcionario
      WHERE ft.funcionario_idfuncionario = ? AND tf.tipo_funcionario = 'instructor'
    `, [idFuncionario]);

    if (checkInstructor.length === 0) {
      return {
        success: false,
        message: "El funcionario no es instructor o no existe"
      };
    }

    // Verificar si la ficha existe
    const checkFicha = await Conexion.query(
      "SELECT idficha FROM ficha WHERE idficha = ?",
      [idFicha]
    );

    if (checkFicha.length === 0) {
      return {
        success: false,
        message: "La ficha no existe"
      };
    }

    // Verificar si ya existe la asignación
    const checkAsignacion = await Conexion.query(
      "SELECT * FROM funcionario_has_ficha WHERE funcionario_idfuncionario = ? AND ficha_idficha = ?",
      [idFuncionario, idFicha]
    );

    if (checkAsignacion.length > 0) {
      return {
        success: true,
        message: "El instructor ya está asignado a esta ficha"
      };
    }

    // Realizar la asignación
    await Conexion.query(
      "INSERT INTO funcionario_has_ficha (funcionario_idfuncionario, ficha_idficha) VALUES (?, ?)",
      [idFuncionario, idFicha]
    );

    return {
      success: true,
      message: "Ficha asignada exitosamente al instructor"
    };
  } catch (error) {
    console.error(`Error al asignar ficha ${idFicha} a instructor ${idFuncionario}:`, error);
    return {
      success: false,
      message: "Error al asignar ficha a instructor",
      error
    };
  }
};

// Desasignar ficha de instructor
export const desasignarFichaDeInstructor = async (
  idFuncionario: number,
  idFicha: number
): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si existe la asignación
    const checkAsignacion = await Conexion.query(
      "SELECT * FROM funcionario_has_ficha WHERE funcionario_idfuncionario = ? AND ficha_idficha = ?",
      [idFuncionario, idFicha]
    );

    if (checkAsignacion.length === 0) {
      return {
        success: false,
        message: "El instructor no está asignado a esta ficha"
      };
    }

    // Eliminar la asignación
    await Conexion.query(
      "DELETE FROM funcionario_has_ficha WHERE funcionario_idfuncionario = ? AND ficha_idficha = ?",
      [idFuncionario, idFicha]
    );

    return {
      success: true,
      message: "Ficha desasignada exitosamente del instructor"
    };
  } catch (error) {
    console.error(`Error al desasignar ficha ${idFicha} de instructor ${idFuncionario}:`, error);
    return {
      success: false,
      message: "Error al desasignar ficha de instructor",
      error
    };
  }
};

// Listar tipos de funcionario (roles)
export const listarTiposFuncionario = async (): Promise<ServiceResponse<{ idtipo_funcionario: number, tipo_funcionario: string }[]>> => {
  try {
    const query = "SELECT idtipo_funcionario, tipo_funcionario FROM tipo_funcionario";
    const result = await Conexion.query(query);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Error al listar tipos de funcionario:", error);
    return {
      success: false,
      message: "Error al obtener tipos de funcionario",
      error
    };
  }
};