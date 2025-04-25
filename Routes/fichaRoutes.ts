import { Router } from "../Dependencies/dependencias.ts";
import { authMiddleware } from "../Middlewares/authMiddleware.ts";

import {
    fichasActivasByIdfunc,
    getFichasPorPrograma,
    getFichaPorId,
    getEstadosFicha,
    fichasConPrograma,
    fichasAsignadasPorFuncionario,
    createFicha,
    updateFicha,
    deleteFicha,
    asignarInstructor,
    removerInstructor
} from "../Controllers/fichaController.ts";

const RouterFicha = new Router();

RouterFicha
  // Rutas existentes
  .get("/fichas/instructor/:id", authMiddleware, fichasAsignadasPorFuncionario)
  .get("/fichas_activas/instructor/:id", authMiddleware, fichasActivasByIdfunc)
  .get("/fichas/programa/:programa_id", authMiddleware, getFichasPorPrograma)
  .get("/fichas/:id", authMiddleware, getFichaPorId)
  .get("/estados_ficha", authMiddleware, getEstadosFicha)
  .get("/fichas", authMiddleware, fichasConPrograma)

  // CUD
  .post("/fichas", authMiddleware, createFicha)
  .put("/fichas/:id", authMiddleware, updateFicha)
  .delete("/fichas/:id", authMiddleware, deleteFicha)

  // Asignar Instructores
  .post("/fichas/:id/asignar-instructor", authMiddleware, asignarInstructor)
  .post("/fichas/:id/remover-instructor", authMiddleware, removerInstructor)

export default RouterFicha;