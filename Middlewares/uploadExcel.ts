import { Context } from "../Dependencies/dependencias.ts";
import { read, utils } from "../Dependencies/dependencias.ts";

export async function excelUploadMiddleware(ctx: Context, next: () => Promise<unknown>) {
  try {
    // En Oak 17.14, la forma de acceder al form-data es diferente
    const body = ctx.request.body();
    
    // Verificamos que el request sea multipart
    if (body.type !== "form-data") {
      ctx.throw(400, "La solicitud debe ser multipart/form-data");
    }
    
    // Obtenemos el form data
    const formData = await body.value;
    console.log("FormData recibido:", formData);

    // Obtenemos el campo de archivo con nombre "excel"
    const fileField = formData.files?.find(file => file.name === "excel");
    
    if (!fileField) {
      ctx.throw(400, "No se envió un archivo Excel válido");
    }

    let arrayBuffer: ArrayBuffer;
    
    // En Oak 17.14, los archivos se guardan en un archivo temporal
    // y podemos acceder a su contenido a través de su ruta
    if (fileField.tempFilePath) {
      // Leemos el archivo desde la ruta temporal
      const fileData = await Deno.readFile(fileField.tempFilePath);
      arrayBuffer = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength);
    } else {
      ctx.throw(400, "El archivo no tiene una ruta temporal válida");
    }

    // Procesamos el Excel usando SheetJS
    const workbook = read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(worksheet);

    // Guardamos los datos en ctx.state para que el controlador los use
    ctx.state.excelData = jsonData;
    await next();
  } catch (error) {
    console.error("Error en excelUploadMiddleware:", error);
    ctx.throw(400, `Error al procesar el archivo Excel: ${error.message}`);
  }
}