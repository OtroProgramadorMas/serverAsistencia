// deno-lint-ignore-file
import { generarToken } from "../Helpers/jwt.ts";
import { listarFuncionario } from "../Models/funcModel.ts";
import { listarAprendiz } from "../Models/aprendizModel.ts";

export const iniciarSesion = async (ctx: any) => {
  const { response, request } = ctx;
  const { email, password, tipo } = await request.body.json();

  try {
    let usuario;

    if (tipo === "funcionario") {
      const funcionarios = await listarFuncionario();
      if (!Array.isArray(funcionarios)) {
        throw new Error("listarFuncionario no devolvió un array");
      }
      usuario = funcionarios.find(
        (func: any) => func.email === email && func.password === password,
      );
    } else if (tipo === "aprendiz") {
      const aprendices = await listarAprendiz();
      if (!Array.isArray(aprendices)) {
        throw new Error("listarAprendiz no devolvió un array");
      }
      usuario = aprendices.find(
        (apr: any) => apr.email_aprendiz === email && apr.password_aprendiz === password,
      );
    } else {
      response.status = 400;
      response.body = { message: "Tipo de usuario no válido" };
      return;
    }

    if (usuario) {
      const token = await generarToken(usuario.nombres);
      response.status = 200;
      response.body = { token };
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