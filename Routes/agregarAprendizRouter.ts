import { Router } from "../Dependencies/dependencias.ts";
import { listarAprendices,agregarAprendices,obtenerAprendicesPorFicha } from "../Controllers/agregarAprendizController.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const RouterAgregarAprendiz = new Router();


RouterAgregarAprendiz.get("/AgregarAprendices",authMiddleware, listarAprendices );

RouterAgregarAprendiz.post("/upload-excel",authMiddleware,agregarAprendices);


RouterAgregarAprendiz.get("/aprendices/ficha/:id", authMiddleware,obtenerAprendicesPorFicha);




export default RouterAgregarAprendiz;