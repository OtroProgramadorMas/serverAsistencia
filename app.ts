import { Application, oakCors } from "./Dependencies/dependencias.ts";
import { logData } from "./Middlewares/logData.ts";

// Routers
import { RouterLogin } from "./Routes/loginUsers.ts";
import RouterFunc from "./Routes/funcionarioRoutes.ts";
import RouterFicha from "./Routes/fichaRoutes.ts"

const app = new Application();

app.use(oakCors());
app.use(logData);

const Routes = [RouterLogin, RouterFunc, RouterFicha];

Routes.forEach((router) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
});

const puerto = 8000;
console.log("servidor corriendo por el puerto " + puerto)
app.listen({port: puerto})