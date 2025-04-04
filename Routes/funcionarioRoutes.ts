import { Router } from "../Dependencies/dependencias.ts"
import { findFuncionarioById } from "../Controllers/funcionarioController.ts"
import { authMiddleware } from "../Middlewares/authMiddleware.ts"

const RouterFunc = new Router();

RouterFunc.get("/funcionarios/:id",authMiddleware, findFuncionarioById);

export default RouterFunc;