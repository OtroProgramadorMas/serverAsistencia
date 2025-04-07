import { Router } from "../Dependencies/dependencias.ts";
import { 
  getAsistenciasByAprendizId, 
  createAsistencia, 
  updateAsistencia, 
  deleteAsistencia,
  getTiposAsistencia
} from "../Controllers/historialController.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const routerHistorial = new Router();

// Obtener tipos de asistencia
routerHistorial.get("/asistencia/tipos", authMiddleware, getTiposAsistencia);

// Obtener asistencias por ID de aprendiz
routerHistorial.get("/asistencia/aprendiz/:id", authMiddleware, getAsistenciasByAprendizId);

// Crear 
routerHistorial.post("/asistencia", authMiddleware, createAsistencia);

// Actualizar 
routerHistorial.put("/asistencia/:id", authMiddleware, updateAsistencia);

// Eliminar 
routerHistorial.delete("/asistencia/:id", authMiddleware, deleteAsistencia);

export default routerHistorial;