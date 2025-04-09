import { Router } from "../Dependencies/dependencias.ts";
import { getTipoDocumentos } from "../Controllers/tipoDocumentoControlller.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

const routerTipoDoc = new Router ();

routerTipoDoc.get("/tipoDocumento",authMiddleware,getTipoDocumentos);

export default routerTipoDoc;