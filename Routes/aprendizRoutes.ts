import { Router } from "../Dependencies/dependencias.ts";
import { findAprendizById, getAllAprendices } from "../Controllers/aprendizController.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const RouterAprendiz = new Router();


RouterAprendiz.get("/aprendices", authMiddleware, getAllAprendices);


RouterAprendiz.get("/aprendiz/:id", authMiddleware, findAprendizById);

export default RouterAprendiz;