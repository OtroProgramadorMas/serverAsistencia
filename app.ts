import { Application, Router, oakCors } from "./Dependencies/dependencias.ts";
import { logData } from "./Middlewares/logData.ts";

// Routers
import { RouterLogin } from "./Routes/loginUsers.ts";
import RouterFunc from "./Routes/funcionarioRoutes.ts";
import RouterFicha from "./Routes/fichaRoutes.ts";
import routerAsistencia from "./Routes/asistenciaRutes.ts";
import RouterAprendiz from "./Routes/aprendizRoutes.ts";
import routerHistorial from "./Routes/historialRoutes.ts";
import routerPrograma from "./Routes/programasRoutes.ts";

// Imagenes
import { uploadImageMiddleware } from "./Middlewares/uploadFile.ts";
import { serveStatic } from "./Utilities/imageUrl.ts";

const app = new Application();

app.use(oakCors());
app.use(logData);


// Router para subida de imagenes
app.use(serveStatic("."));
const uploadRouter = new Router();
uploadRouter.post("/upload", uploadImageMiddleware);

const Routes = [
  RouterLogin,
  RouterFunc,
  RouterFicha,
  RouterLogin,
  RouterFunc,
  routerAsistencia,
  RouterAprendiz,
  routerHistorial,
  routerPrograma,
  uploadRouter
];
Routes.forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});

const puerto = 8000;
console.log("servidor corriendo por el puerto " + puerto);
app.listen({ port: puerto });
