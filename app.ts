// app.ts modificado para incluir la ruta de recuperación de contraseña
import { Application, oakCors } from "./Dependencies/dependencias.ts";
import { RouterLogin } from "./Routes/loginUsers.ts";
import RouterFunc from "./Routes/funcionarioRoutes.ts";
import routerAsistencia from "./Routes/asistenciaRutes.ts";
import RouterAprendiz from "./Routes/aprendizRoutes.ts";
import routerHistorial from "./Routes/historialRoutes.ts";
import RouterRecuperarPassword from "./Routes/passwordRecoveryRoutes.ts";
import { Conexion } from "./Models/conexion.ts";
import { logData } from "./Middlewares/logData.ts";
import { crearTablaCodigosRecuperacion } from "./Models/passwordRecoveryModel.ts";

const app = new Application();

app.use(oakCors());
app.use(logData);

const Routes = [
  RouterLogin, 
  RouterFunc, 
  routerAsistencia,
  RouterAprendiz,
  routerHistorial,
  RouterRecuperarPassword 
];

Routes.forEach((router) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
});

// Inicializar tablas necesarias
const iniciarDB = async () => {
  try {
    // Crear tabla para códigos de recuperación si no existe
    await crearTablaCodigosRecuperacion();
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
};
/////////////////////////////////////////////////////////////////////////////////////
try {
  const testQuery = "SELECT 1 as test";
  const result = await Conexion.query(testQuery);
  console.log("Conexión exitosa a la base de datos:", result);
} catch (error) {
  console.error("Error de conexión a la base de datos:", error);
}
////////////////////////////////////////////////////////////////////////////////////
iniciarDB();

const puerto = 8000;
console.log("Servidor corriendo por el puerto " + puerto);
app.listen({port: puerto});