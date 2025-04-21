// deno-lint-ignore-file
import { generarToken } from "../Helpers/jwt.ts";
import { listarFuncionariosPorRol } from "../Models/funcionarioModel.ts";
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
      // Convertir tipo a formato correcto para la nueva función (administrador o instructor en minúsculas)
      const rolMinuscula = tipo.toLowerCase();
      
      // Usar la nueva función que devuelve una estructura ServiceResponse
      const resultado = await listarFuncionariosPorRol(rolMinuscula);
      
      if (!resultado.success || !resultado.data) {
        throw new Error(`Error al obtener ${rolMinuscula}es`);
      }
      
      const funcionarios = resultado.data;
      
      // Buscar el usuario verificando la contraseña en los roles
      usuario = funcionarios.find(func => {
        if (func.email === email) {
          // Buscar el rol que coincida con el tipo solicitado y verificar la contraseña
          const rolEncontrado = func.roles.find(r => 
            r.tipo_funcionario.toLowerCase() === rolMinuscula && r.password === password
          );
          
          return !!rolEncontrado; // Devuelve true si se encontró el rol con la contraseña correcta
        }
        return false;
      });
      
      if (usuario) {
        tokenPayload = {
          id: usuario.idFuncionario,
          nombre: `${usuario.nombres} ${usuario.apellidos}`,
          email: usuario.email,
          tipo: "funcionario",
          rol: rolMinuscula
        };
      }
    } else if (tipo === "aprendiz") {
      const resultado = await listarAprendices();
      
      if (!resultado.success || !resultado.aprendices) {
        throw new Error("Error al obtener aprendices");
      }
      
      // Ahora trabajamos con el array de aprendices
      const aprendices = resultado.aprendices;
      
      if (!Array.isArray(aprendices)) {
        throw new Error("listarAprendiz no devolvió un array");
      }
      
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
      const token = await generarToken(tokenPayload.nombre); // Enviamos el nombre para el token
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