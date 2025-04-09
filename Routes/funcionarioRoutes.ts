import { Router } from "../Dependencies/dependencias.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

import {
  findFuncionarioById,
  listarInstructores,
  crearFuncionarioConRol
} from "../Controllers/funcionarioController.ts";

const RouterFunc = new Router();

RouterFunc.get("/funcionarios/:id", authMiddleware, findFuncionarioById);
RouterFunc.get("/func_instructores/", authMiddleware, listarInstructores);
RouterFunc.post("/funcionarios/", authMiddleware, crearFuncionarioConRol)

export default RouterFunc;
