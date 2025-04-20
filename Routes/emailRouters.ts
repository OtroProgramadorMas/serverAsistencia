import { Router } from "../Dependencies/dependencias.ts";
import { 
  solicitarCodigoRecuperacion, 
  verificarCodigoYActualizarPassword 
} from "../Controllers/emailControllers.ts";

const RouterPasswordRecovery = new Router();

// Ruta para solicitar código de recuperación
RouterPasswordRecovery.post("/solicitar-codigo", solicitarCodigoRecuperacion);

// Ruta para verificar código y actualizar contraseña
RouterPasswordRecovery.post("/verificar-codigo", verificarCodigoYActualizarPassword);

export { RouterPasswordRecovery };