import { Router } from "../Dependencies/dependencias.ts"; 
import { authMiddleware } from "../Middlewares/authMiddleware.ts";  

import {   
  listarFuncionarios,   
  listarAdministradores,   
  listarInstructores,   
  obtenerFuncionario,   
  listarRoles,   
  crearFuncionario,   
  actualizarFuncionario,   
  eliminarFuncionarioController,   
  asignarFicha,   
  desasignarFicha 
} from "../Controllers/funcionarioController.ts";  

const RouterFunc = new Router();  

// Rutas para consultas 
RouterFunc.get("/funcionarios", authMiddleware, listarFuncionarios); 
RouterFunc.get("/funcionarios/administradores", authMiddleware, listarAdministradores); 
RouterFunc.get("/funcionarios/instructores", authMiddleware, listarInstructores); 
RouterFunc.get("/funcionarios/roles", authMiddleware, listarRoles); 
RouterFunc.get("/funcionarios/:id", authMiddleware, obtenerFuncionario);  

// IMPORTANTE: Primero definir rutas específicas para fichas
RouterFunc.post("/funcionarios/fichas/asignar", authMiddleware, asignarFicha); 
RouterFunc.post("/funcionarios/fichas/desasignar", authMiddleware, desasignarFicha);

// Rutas para crear, actualizar y eliminar funcionarios (después de las rutas específicas)
RouterFunc.post("/funcionarios", authMiddleware, crearFuncionario); 
RouterFunc.put("/funcionarios/:id", authMiddleware, actualizarFuncionario); 
RouterFunc.delete("/funcionarios/:id", authMiddleware, eliminarFuncionarioController);  

export default RouterFunc;