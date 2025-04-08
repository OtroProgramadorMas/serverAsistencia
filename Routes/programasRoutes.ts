import { Router } from "../Dependencies/dependencias.ts";
import {authMiddleware} from "../Middlewares/authMiddleware.ts"
import { getAllProgramas, createPrograma } from "../Controllers/programaController.ts";

const routerPrograma = new Router();

// Ruta para obtener todos los programas
routerPrograma.get("/programas",authMiddleware, getAllProgramas);

// Ruta para crear un nuevo programa
routerPrograma.post("/programas",authMiddleware, createPrograma);


export default routerPrograma;