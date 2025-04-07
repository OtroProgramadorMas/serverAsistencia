import { Router } from "../Dependencies/dependencias.ts";
import { findAprendizById, getAllAprendices, AprendicesByIdFicha } from "../Controllers/aprendizController.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const RouterAprendiz = new Router();


RouterAprendiz.get("/aprendices", authMiddleware, getAllAprendices);
RouterAprendiz.get("/aprendiz/:id", authMiddleware, findAprendizById);
RouterAprendiz.get("/aprendiz_ficha/:id", authMiddleware, AprendicesByIdFicha);

export default RouterAprendiz;