// adminRoutes.ts
import { Router } from "../Dependencies/dependencias.ts";
import { 
  getAdministradores, 
  getAdministradorPorId, 
  createAdministrador, 
  updateAdministrador, 
  deleteAdministrador 
} from "../Controllers/adminController.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const routerAdmin = new Router();

// Rutas para administradores
routerAdmin
  .get("/administradores", authMiddleware, getAdministradores)
  .get("/administradores/:id", authMiddleware, getAdministradorPorId)
  .post("/administradores", authMiddleware, createAdministrador)
  .put("/administradores/:id", authMiddleware, updateAdministrador)
  .delete("/administradores/:id", authMiddleware, deleteAdministrador);

export default routerAdmin;