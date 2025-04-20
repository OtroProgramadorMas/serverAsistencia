import { Router } from "../Dependencies/dependencias.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

import {
  listarFuncionarios, 
  listarAdministradores, 
  listarInstructores, 
  obtenerFuncionario,
  listarRoles
} from "../Controllers/funcionarioController.ts";

const RouterFunc = new Router();

RouterFunc.get("/funcionarios", authMiddleware, listarFuncionarios);
RouterFunc.get("/funcionarios/administradores", authMiddleware, listarAdministradores);
RouterFunc.get("/funcionarios/instructores", authMiddleware, listarInstructores);
RouterFunc.get("/funcionarios/roles", authMiddleware, listarRoles);
RouterFunc.get("/funcionarios/:id", authMiddleware, obtenerFuncionario);

export default RouterFunc;
