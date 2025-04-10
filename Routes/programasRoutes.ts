import { Router } from "../Dependencies/dependencias.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts"
import { 
    getAllProgramas, 
    getProgramaById, 
    createPrograma, 
    updatePrograma, 
    deletePrograma 
} from "../Controllers/programaController.ts";

const routerPrograma = new Router();

routerPrograma
  .get("/programas", authMiddleware, getAllProgramas)
  .get("/programas/:id", authMiddleware, getProgramaById)
  .post("/programas", authMiddleware, createPrograma)
  .put("/programas/:id", authMiddleware, updatePrograma)
  .delete("/programas/:id", authMiddleware, deletePrograma);


export default routerPrograma;