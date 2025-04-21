import { Router } from "../Dependencies/dependencias.ts";
import { getTipoFichas } from "../Controllers/tipoFichaController.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const routerTipoFichas = new Router ();

routerTipoFichas.get("/tipofichacargo",getTipoFichas);

export default routerTipoFichas;