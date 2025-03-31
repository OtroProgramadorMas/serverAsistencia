import { Conexion } from "./conexion.ts";

export interface funcionario {
  idFuncionario: number | null;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario: string | null;
  password: string;
  id_tipoDocumento: number;
}

export const listarFuncionario = async () => {
  try {
    const result = await Conexion.query("SELECT * FROM funcionario");
    return result as funcionario[];
  } catch (error) {
    console.error("Error al listar Funcionarios", error);
    return[];
  }
};
