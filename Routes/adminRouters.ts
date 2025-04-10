// adminRouters.ts
import { Router } from "../Dependencies/dependencias.ts";
import { 
  getAdministradores,
  getAdministradorPorId,
  createAdministrador,
  updateAdministrador,
  deleteAdministrador,
  buscarAdministrador
} from "../Controllers/adminController.ts";

const router = new Router();

// Rutas de Administradores
router
  .get("/administradores", getAdministradores)
  .get("/administradores/buscar/:termino", buscarAdministrador)
  .get("/administradores/:id", getAdministradorPorId)
  .post("/administradores", createAdministrador)
  .put("/administradores/:id", updateAdministrador)
  .delete("/administradores/:id", deleteAdministrador);

export default router;