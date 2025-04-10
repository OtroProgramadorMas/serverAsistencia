import { insertarDatosExcelc, ListarAprendices, obtenerAprendicesPorFichaId } from "../Models/aprendizExcelModel.ts";
import { read, utils } from "https://cdn.sheetjs.com/xlsx-0.18.5/package/xlsx.mjs";
import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";


export const agregarAprendices = async (ctx: Context) => {
  try {
    const body = ctx.request.body({ type: "form-data" });
    const formData = await body.value.read({ maxFileSize: 10_000_000 });

    const file = formData.files?.find((f) => f.name === "excel");

    if (!file || !file.filename) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, msg: "Archivo Excel no proporcionado" };
      return;
    }

    const content = await Deno.readFile(file.filename);
    const workbook = read(content, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json(sheet);

    const resultado = await insertarDatosExcelc(data);

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      msg: "Aprendices agregados correctamente",
      resultado,
    };
  } catch (error) {
    console.error("❌ Error al agregar aprendices:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: "Error interno del servidor al procesar el archivo Excel",
    };
  }
};



// Controlador para obtener aprendices por ficha
export const obtenerAprendicesPorFicha = async (ctx: any) => {
  const idFicha = ctx.params.id;

  try {
    const aprendices = await obtenerAprendicesPorFichaId(idFicha);

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      aprendices,
    };
  } catch (error) {
    console.error("Error al obtener aprendices por ficha:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: "Error al obtener los aprendices de la ficha",
    };
  }
};



// Controlador para listar aprendices cargados desde Excel
export const listarAprendices = async (ctx: any) => {
  try {
    const aprendices = await ListarAprendices();

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      aprendices,
    };
  } catch (error) {
    console.error("Error al listar aprendices:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: "Error al obtener la lista de aprendices",
    };
  }
};




// import { Context } from "../Dependencies/dependencias.ts";
// import { z } from "../Dependencies/dependencias.ts";
// import {  ListarAprendices,insertarDatosExcelc } from "../Models/aprendizExcelModel.ts";




// export const getAllAprendices = async (ctx: any) => {
//   const { response } = ctx;
  
//   try {
//     const aprendices = await ListarAprendices();
    
//     response.status = 200;
//     response.body = { success: true, aprendices };
//   } catch (error) {
//     console.error("Error en getAllProgramas:", error);
//     response.status = 500;
//     response.body = { success: false, msg: "Error interno del servidor" };
//   }
// };


// export const uploadExcelController = async (ctx: Context) => {

//     try {
//     const excelData = ctx.state.excelData;
//     if (!excelData || !Array.isArray(excelData)) {
//       ctx.throw(400, "Los datos del archivo Excel no son válidos");
//     }
//     const result = await insertarDatosExcel(excelData);
//     ctx.response.status = result.success ? 200 : 400;
//     ctx.response.body = result;
//   } catch (error) {
//     console.error("Error en uploadExcelController:", error);
//     ctx.throw(500, "Error interno del servidor");
//   }
// };

