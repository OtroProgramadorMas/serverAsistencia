import { Router } from "../Dependencies/dependencias.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";
import { fichasByIdfunc } from "../Controllers/fichaController.ts"

const RouterFicha = new Router();

RouterFicha.get("/fichas/:id", authMiddleware, fichasByIdfunc);

export default RouterFicha;