import { fichasByIdfunc } from "../Controllers/fichaController.ts"
import { fichaById } from "../Controllers/fichaController.ts";

const RouterFicha = new Router();

RouterFicha.get("/ficha_func/:id", authMiddleware, fichasByIdfunc);
RouterFicha.get("/fichas/:id", authMiddleware, fichaById);

import {
    fichasByIdfunc,
    getFichasPorPrograma,
    getFichaPorId,
    getEstadosFicha,
    createFicha,
    updateFicha,
    deleteFicha,
    asignarInstructor,
    removerInstructor
} from "../Controllers/fichaController.ts";

const RouterFicha = new Router();

RouterFicha
    .get("/fichas/:func_id", authMiddleware, fichasByIdfunc)
    .get("/fichas/programa/:programa_id", authMiddleware, getFichasPorPrograma)
    .get("/fichas/:id", authMiddleware, getFichaPorId)
    .get("/estados_ficha", authMiddleware, getEstadosFicha)


    // CUD
    .post("/fichas", authMiddleware, createFicha)
    .put("/fichas/:id", authMiddleware, updateFicha)
    .delete("/fichas/:id", authMiddleware, deleteFicha)

    // Asignar Instructores 
    .post("/fichas/:id/asignar-instructor", authMiddleware, asignarInstructor)
    .post("/fichas/:id/remover-instructor", authMiddleware, removerInstructor);

export default RouterFicha;