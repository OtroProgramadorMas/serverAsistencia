// deno-lint-ignore-file
import { generarToken } from "../Helpers/jwt.ts";
import { listarFuncionario_Roles } from "../Models/funcModel.ts";
import { listarAprendices } from "../Models/aprendizModel.ts";

interface TokenPayload {
  id: number | null;
  nombre: string;
  email: string;
  tipo: string;
  rol?: string; // Opcional porque no todos los usuarios tienen rol
}

export const iniciarSesion = async (ctx: any) => {
  const { response, request } = ctx;
  
  try {
    // Verificamos que body exista y podamos hacer json()
    if (!request.body || typeof request.body.json !== 'function') {
      response.status = 400;
      response.body = { message: "Cuerpo de solicitud no válido" };
      return;
    }

    const body = await request.body.json().catch(() => null);
    if (!body) {
      response.status = 400;
      response.body = { message: "JSON no válido en el cuerpo de la solicitud" };
      return;
    }

    const { email, password, tipo } = body;

    // Validamos los campos requeridos
    if (!email || !password || !tipo) {
      response.status = 400;
      response.body = { message: "Faltan campos requeridos (email, password, tipo)" };
      return;
    }

    let usuario = null;
    let tokenPayload: TokenPayload = {
      id: null,
      nombre: "",
      email: "",
      tipo: "",
    };

    if (tipo === "Instructor" || tipo === "Administrador") {
      // Obtener funcionarios y manejar posible error
      let funcionarios = await listarFuncionario_Roles(tipo);
      
      // Verificamos que funcionarios sea un array
      if (!funcionarios) funcionarios = [];
      if (!Array.isArray(funcionarios)) {
        console.error("listarFuncionario_Roles no devolvió un array:", funcionarios);
        funcionarios = [];
      }
      
      usuario = funcionarios.find(
        (func) => func.email === email && func.password === password
      );
      
      if (usuario) {
        tokenPayload = {
          id: Number(usuario.idFuncionario) || null,
          nombre: usuario.nombres || "",
          email: usuario.email || "",
          tipo: "funcionario",
          rol: usuario.rol || ""
        };
      }
    } else if (tipo === "aprendiz") {
      // Obtener aprendices y manejar la estructura de respuesta correcta
      const aprendicesResponse = await listarAprendices();
      
      // Verificamos si la respuesta fue exitosa y contiene el array de aprendices
      if (!aprendicesResponse.success || !aprendicesResponse.aprendices) {
        console.error("Error al obtener aprendices:", aprendicesResponse);
        response.status = 500;
        response.body = { message: "Error al obtener lista de aprendices" };
        return;
      }
      
      // Ahora trabajamos con el array de aprendices
      const aprendices = aprendicesResponse.aprendices;
      
      usuario = aprendices.find(
        (apr) => apr.email_aprendiz === email && apr.password_aprendiz === password
      );
      
      if (usuario) {
        tokenPayload = {
          id: Number(usuario.idaprendiz) || null,
          nombre: usuario.nombres_aprendiz || "",
          email: usuario.email_aprendiz || "",
          tipo: "aprendiz"
        };
      }
    } else {
      response.status = 400;
      response.body = { message: "Tipo de usuario no válido" };
      return;
    }

    if (usuario) {
      const token = await generarToken(tokenPayload.nombre);
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
    response.body = { message: "Error en el servidor: " + (error instanceof Error ? error.message : String(error)) };
  }
};