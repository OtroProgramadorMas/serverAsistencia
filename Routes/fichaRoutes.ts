import { Router } from "../Dependencies/dependencias.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

import { fichasByIdfunc } from "../Controllers/fichaController.ts"
import { fichaById } from "../Controllers/fichaController.ts";

const RouterFicha = new Router();

RouterFicha.get("/ficha_func/:id", authMiddleware, fichasByIdfunc);
RouterFicha.get("/fichas/:id", authMiddleware, fichaById);


export default RouterFicha;