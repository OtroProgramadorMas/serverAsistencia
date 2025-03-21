import { Router } from "../Dependencies/dependencias.ts";
import { iniciarSesion } from "../Controllers/loginController.ts";

const RouterLogin = new Router();
RouterLogin.post("/",iniciarSesion);

export { RouterLogin };