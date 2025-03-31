// deno-lint-ignore-file
import { generarToken } from "../Helpers/jwt.ts";
import { listarFuncionario_Roles } from "../Models/funcModel.ts";
import { listarAprendiz } from "../Models/aprendizModel.ts";

interface TokenPayload {
  id: number | null;
  nombre: string;
  email: string;
  tipo: string;
  rol?: string; // Opcional porque no todos los usuarios tienen rol
}

export const iniciarSesion = async (ctx: any) => {
  const { response, request } = ctx;
  const { email, password, tipo } = await request.body.json();

  try {
    let usuario;
    let tokenPayload: TokenPayload = {
      id: null, // Inicializamos como null
      nombre: "",
      email: "",
      tipo: "",
    };

    if (tipo === "funcionario" || tipo === "administrador") {
      const funcionarios = await listarFuncionario_Roles(tipo);
      if (!Array.isArray(funcionarios)) {
        throw new Error("listarFuncionario no devolvió un array");
      }
      
      usuario = funcionarios.find(
        (func) => func.email === email && func.password === password
      );
      
      if (usuario) {
        tokenPayload = {
          id: usuario.idFuncionario, // Asumiento que es number
          nombre: usuario.nombres,
          email: usuario.email,
          tipo: "funcionario",
          rol: usuario.rol
        };
      }
    } else if (tipo === "aprendiz") {
      const aprendices = await listarAprendiz();
      if (!Array.isArray(aprendices)) {
        throw new Error("listarAprendiz no devolvió un array");
      }
      
      usuario = aprendices.find(
        (apr) => apr.email === email && apr.password === password
      );
      
      if (usuario) {
        tokenPayload = {
          id: usuario.idAprendiz as number, // Aseguramos que es number
          nombre: usuario.nombres,
          email: usuario.email,
          tipo: "aprendiz"
        };
      }
    } else {
      response.status = 400;
      response.body = { message: "Tipo de usuario no válido" };
      return;
    }

    if (usuario) {
      const token = await generarToken(tokenPayload.nombre); // Enviamos todo el payload
      response.status = 200;
      response.body = { 
        token,
        user: {
          id: tokenPayload.id,
          nombre: tokenPayload.nombre,
          email: tokenPayload.email,
          tipo: tokenPayload.tipo,
          rol: tokenPayload.rol || null
        }
      };
    } else {
      response.status = 401;
      response.body = { message: "Credenciales incorrectas" };
    }
  } catch (error) {
    console.error("Error en el servidor:", error);
    response.status = 500;
    response.body = { message: "Error en el servidor" };
  }
};