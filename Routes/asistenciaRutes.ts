import { Router } from "../Dependencies/dependencias.ts";
import { getAsistencia } from "../Controllers/asistenciasControllers.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const routerAsistencia = new Router();

routerAsistencia.get("/asistencia",authMiddleware,getAsistencia);

export default routerAsistencia;