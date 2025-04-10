import { Router } from "../Dependencies/dependencias.ts";
import { 
  findAprendizById, 
  getAllAprendices,
  findAprendicesByDocumento,
  findAprendicesByFicha,
  getEstadosAprendiz,
  createAprendiz,
  updateAprendiz,
  deleteAprendiz
} from "../Controllers/aprendizController.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const RouterAprendiz = new Router();

// Ruta para obtener todos los aprendices
RouterAprendiz.get("/aprendices", authMiddleware, getAllAprendices);
RouterAprendiz.get("/aprendiz/:id", authMiddleware, findAprendizById);
RouterAprendiz.get("/aprendiz_ficha/:id", authMiddleware, AprendicesByIdFicha);

// Ruta para buscar aprendices por número de documento
RouterAprendiz.get("/aprendices/documento/:documento", authMiddleware, findAprendicesByDocumento);

// Ruta para obtener todos los aprendices de una ficha específica
RouterAprendiz.get("/aprendices/ficha/:fichaId", authMiddleware, findAprendicesByFicha);

// Ruta para obtener todos los estados aprendices
RouterAprendiz.get("/estado_aprendiz", authMiddleware, getEstadosAprendiz);

// Ruta para crear un nuevo aprendiz
RouterAprendiz.post("/aprendiz", authMiddleware, createAprendiz);

// Ruta para actualizar información de un aprendiz
RouterAprendiz.put("/aprendiz/:id", authMiddleware, updateAprendiz);

// Ruta para eliminar un aprendiz
RouterAprendiz.delete("/aprendiz/:id", authMiddleware, deleteAprendiz);

export default RouterAprendiz;