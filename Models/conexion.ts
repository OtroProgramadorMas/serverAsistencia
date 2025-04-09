import { Client } from "../Dependencies/dependencias.ts";

export const Conexion = await new Client().connect({
    hostname: "localhost",
    username: "root",
    password: "",
    db: "edu_sena",
    poolSize: 10, 
    timeout: 60000 
});
