import { Conexion } from "./conexion.ts";

export interface asistencia {
    idasistencia: number | null;
    fecha_asistencia: Date;
    nombre_tipo_asistencia: string;
    documento_aprendiz: number;
    nombre_aprendiz: string;
    apellidos_aprendiz: string;
    telefono_aprendiz: number;
    email_aprendiz: string
    aprendiz_idaprendiz: number;
    tipo_asistencia_idtipo_asistencia: number;
}

export interface tipo_asistencia {
    idtipo_asistencia: number | null;
    nombre_tipo_asistencia: string;
}

// Nueva interfaz para gestión masiva de asistencias
export interface AsistenciaMasiva {
    idAprendiz: number;
    idTipoAsistencia: number;
}

// Nueva interfaz para resultados de operaciones
export interface ResultadoOperacion {
    success: boolean;
    error?: any;
    id?: number;
    existen?: boolean;
}


// Listar

export const listarAsistencia = async () => {
    try {
        const result = await Conexion.query('SELECT a.idasistencia, a.fecha_asistencia,ta.nombre_tipo_asistencia, ap.documento_aprendiz,ap.nombres_aprendiz,ap.apellidos_aprendiz,ap.telefono_aprendiz, ap.email_aprendiz FROM edu_sena.asistencia a INNER JOIN edu_sena.tipo_asistencia ta ON a.tipo_asistencia_idtipo_asistencia = ta.idtipo_asistencia INNER JOIN edu_sena.aprendiz ap ON a.aprendiz_idaprendiz = ap.idaprendiz ORDER BY a.fecha_asistencia DESC, ap.apellidos_aprendiz, ap.nombres_aprendiz');
        return result as asistencia
    } catch (error) {
        console.error("Error al listar Aprendices", error);
        return [];
    }
}

export const listarTiposAsistencia = async (): Promise<tipo_asistencia[]> => {
    try {
        const result = await Conexion.query(
            'SELECT idtipo_asistencia, nombre_tipo_asistencia AS nombre_tipo_asistencia from tipo_asistencia'
        );
        return result as tipo_asistencia[];
    } catch (error) {
        console.error("Error al listar tipos de asistencia", error);
        return [];
    }
}

// Crud

export const listarAsistenciasPorAprendiz = async (idAprendiz: number): Promise<asistencia[]> => {
    try {
        const query = `
            SELECT 
                a.idasistencia, 
                a.fecha_asistencia, 
                ta.nombre_tipo_asistencia, 
                ap.idaprendiz as aprendiz_idaprendiz, 
                ap.nombres_aprendiz as nombre_aprendiz, 
                ap.apellidos_aprendiz, 
                ap.documento_aprendiz,
                ap.telefono_aprendiz,
                ap.email_aprendiz,
                a.tipo_asistencia_idtipo_asistencia
            FROM edu_sena.asistencia a 
            INNER JOIN edu_sena.tipo_asistencia ta ON a.tipo_asistencia_idtipo_asistencia = ta.idtipo_asistencia 
            INNER JOIN edu_sena.aprendiz ap ON a.aprendiz_idaprendiz = ap.idaprendiz 
            WHERE ap.idaprendiz = ? 
            ORDER BY a.fecha_asistencia DESC
        `;
        
        const result = await Conexion.query(query, [idAprendiz]);
        return result as asistencia[];
    } catch (error) {
        console.error("Error al listar Asistencias del Aprendiz", error);
        return [];
    }
};

// Crear nueva asistencia individual
export const crearAsistencia = async (
    idAprendiz: number,
    idTipoAsistencia: number,
    fecha: string = new Date().toISOString().split('T')[0]
): Promise<ResultadoOperacion> => {
    try {
        const query = `
            INSERT INTO edu_sena.asistencia (
                fecha_asistencia, 
                tipo_asistencia_idtipo_asistencia, 
                aprendiz_idaprendiz
            ) VALUES (?, ?, ?)
        `;
        
        const result = await Conexion.query(query, [fecha, idTipoAsistencia, idAprendiz]);
        return { success: true, id: result.lastInsertId };
    } catch (error) {
        console.error("Error al crear Asistencia", error);
        return { success: false, error };
    }
};

// Actualizar una asistencia existente
export const actualizarAsistencia = async (
    idAsistencia: number,
    idTipoAsistencia: number
): Promise<ResultadoOperacion> => {
    try {
        const query = `
            UPDATE edu_sena.asistencia 
            SET tipo_asistencia_idtipo_asistencia = ? 
            WHERE idasistencia = ?
        `;
        
        await Conexion.query(query, [idTipoAsistencia, idAsistencia]);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar Asistencia", error);
        return { success: false, error };
    }
};

// Eliminar una asistencia
export const eliminarAsistencia = async (idAsistencia: number): Promise<ResultadoOperacion> => {
    try {
        const query = `DELETE FROM edu_sena.asistencia WHERE idasistencia = ?`;
        
        await Conexion.query(query, [idAsistencia]);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar Asistencia", error);
        return { success: false, error };
    }
};


/* 

Metodos Complejos

*/

// Verificar asistencias por fecha y ficha
export const verificarAsistenciasPorFechaYFicha = async (fecha: string, idFicha: number): Promise<ResultadoOperacion> => {
    try {
        const query = `
            SELECT COUNT(*) as total
            FROM edu_sena.asistencia a
            INNER JOIN edu_sena.aprendiz ap ON a.aprendiz_idaprendiz = ap.idaprendiz
            WHERE a.fecha_asistencia = ?
            AND ap.ficha_idficha = ?
        `;
        
        const result = await Conexion.query(query, [fecha, idFicha]);
        return { 
            success: true, 
            existen: result[0]?.total > 0 
        };
    } catch (error) {
        console.error("Error al verificar asistencias", error);
        return { success: false, error };
    }
};

// Guardar múltiples asistencias
export const guardarAsistenciasMasivas = async (
    asistencias: AsistenciaMasiva[],
    fecha: string
): Promise<ResultadoOperacion> => {
    try {
        // Iniciar una transacción para asegurar que todas las asistencias se guarden
        await Conexion.query('START TRANSACTION');
        
        for (const asistencia of asistencias) {
            await crearAsistencia(
                asistencia.idAprendiz,
                asistencia.idTipoAsistencia,
                fecha
            );
        }
        
        await Conexion.query('COMMIT');
        return { success: true };
    } catch (error) {
        // Rollback en caso de error
        await Conexion.query('ROLLBACK');
        console.error("Error al guardar asistencias masivas", error);
        return { success: false, error };
    }
};

// Actualizar múltiples asistencias
export const actualizarAsistenciasMasivas = async (
    asistencias: AsistenciaMasiva[],
    fecha: string
): Promise<ResultadoOperacion> => {
    try {
        await Conexion.query('START TRANSACTION');
        
        for (const asistencia of asistencias) {
            // Primero necesitamos obtener el ID de la asistencia existente
            const query = `
                SELECT idasistencia 
                FROM edu_sena.asistencia 
                WHERE aprendiz_idaprendiz = ? 
                AND fecha_asistencia = ?
            `;
            
            const result = await Conexion.query(query, [asistencia.idAprendiz, fecha]);
            
            if (result.length > 0) {
                const idAsistencia = result[0].idasistencia;
                await actualizarAsistencia(idAsistencia, asistencia.idTipoAsistencia);
            } else {
                // Si no existe, la creamos
                await crearAsistencia(asistencia.idAprendiz, asistencia.idTipoAsistencia, fecha);
            }
        }
        
        await Conexion.query('COMMIT');
        return { success: true };
    } catch (error) {
        await Conexion.query('ROLLBACK');
        console.error("Error al actualizar asistencias masivas", error);
        return { success: false, error };
    }
};