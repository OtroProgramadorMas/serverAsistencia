// Routes/passwordRecoveryRoutes.ts
import { Router } from "../Dependencies/dependencias.ts";

import {
  solicitarRecuperacion,
  verificarCodigo,
  cambiarPassword
} from "../Controllers/passwordRecoveryController.ts";

// Router para las rutas de recuperación de contraseña
export const RouterRecuperarPassword = new Router();

// Definir las rutas
RouterRecuperarPassword
  .post("/auth/recuperar-password", solicitarRecuperacion)
  .post("/auth/verificar-codigo", verificarCodigo)
  .post("/auth/cambiar-password", cambiarPassword);

export default RouterRecuperarPassword;