import { Router } from "../Dependencies/dependencias.ts";
import {
  getAsistencia,
  getTiposAsistencia,
  getAsistenciasByAprendizId,
  createAsistencia,
  updateAsistencia,
  deleteAsistencia,
  checkAsistenciasByFechaAndFicha,
  createAsistenciasMasivas,
  updateAsistenciasMasivas,
} from "../Controllers/asistenciasControllers.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const routerAsistencia = new Router();

// ===== Consultas básicas =====
// Listar todas las asistencias
routerAsistencia.get("/asistencia", authMiddleware, getAsistencia);

// Listar tipos de asistencia
routerAsistencia.get("/asistencia/tipos", authMiddleware, getTiposAsistencia);

// ===== Asistencias por aprendiz =====
// Obtener asistencias de un aprendiz específico
routerAsistencia.get("/asistencia/aprendiz/:id", authMiddleware, getAsistenciasByAprendizId);

// ===== Operaciones CRUD individuales =====
// Crear nueva asistencia individual
routerAsistencia.post("/asistencia", authMiddleware, createAsistencia);

// Actualizar una asistencia existente
routerAsistencia.put("/asistencia/:id", authMiddleware, updateAsistencia);

// Eliminar una asistencia
routerAsistencia.delete("/asistencia/:id", authMiddleware, deleteAsistencia);

// ===== Operaciones para asistencias masivas =====
// Verificar asistencias por fecha y ficha
routerAsistencia.post("/asistencia/verificar", authMiddleware, checkAsistenciasByFechaAndFicha);

// Registrar asistencias masivas 
routerAsistencia.post("/asistencia/masiva", authMiddleware, createAsistenciasMasivas);

// Actualizar asistencias masivas
routerAsistencia.put("/asistencias/masiva", authMiddleware, updateAsistenciasMasivas);



export default routerAsistencia;