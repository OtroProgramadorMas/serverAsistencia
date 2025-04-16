// uploadFile.ts - Versión mejorada para Oak v17.1.4
import { Context } from "../Dependencies/dependencias.ts";
import { ensureDir } from "https://deno.land/std@0.215.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.215.0/path/mod.ts";

// Tipo para Next
type Next = () => Promise<unknown>;

export async function uploadImageMiddleware(ctx: Context, next: Next) {
  // Solo procesar solicitudes POST
  if (ctx.request.method !== "POST") {
    return await next();
  }

  try {
    // Asegurar que existe el directorio de uploads
    const uploadDir = "./uploads";
    await ensureDir(uploadDir);

    // Verificar que la solicitud tiene un content-type válido
    const contentType = ctx.request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      ctx.response.status = 400;
      ctx.response.body = { 
        error: "Content-Type debe ser multipart/form-data", 
        contentTypeRecibido: contentType 
      };
      return;
    }

    // Intentar obtener formData con manejo de errores
    let formData;
    try {
      formData = await ctx.request.body.formData();
    } catch (formError) {
      console.error("Error al procesar formData:", formError);
      ctx.response.status = 400;
      ctx.response.body = { 
        error: "Error al procesar el formData", 
        details: formError instanceof Error ? formError.message : String(formError)
      };
      return;
    }
    
    console.log("FormData procesado correctamente");
    
    // Buscar el archivo en el formData - soportando 'file' o cualquier otro nombre de campo
    let file: File | null = null;
    
    // Primero buscar un campo llamado 'file'
    file = formData.get("file") as File;
    
    // Si no hay campo 'file', buscar el primer File en el formData
    if (!file || !(file instanceof File)) {
      for (const [_, value] of formData.entries()) {
        if (value instanceof File) {
          file = value;
          break;
        }
      }
    }
    
    // Verificar si se encontró algún archivo
    if (!file || !(file instanceof File)) {
      ctx.response.status = 400;
      ctx.response.body = { 
        error: "No se encontró ningún archivo válido",
        campos: Array.from(formData.keys())
      };
      return;
    }

    console.log(`Archivo encontrado: ${file.name}, tipo: ${file.type}`);

    // Leer el contenido del archivo
    let fileContent;
    try {
      fileContent = new Uint8Array(await file.arrayBuffer());
    } catch (readError) {
      console.error("Error al leer el contenido del archivo:", readError);
      ctx.response.status = 500;
      ctx.response.body = { 
        error: "Error al leer el contenido del archivo", 
        details: readError instanceof Error ? readError.message : String(readError)
      };
      return;
    }
    
    // Generar un nombre de archivo único para evitar colisiones
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = join(uploadDir, fileName);
    
    // Guardar archivo en disco
    try {
      await Deno.writeFile(filePath, fileContent);
      console.log(`Archivo guardado en: ${filePath}`);
    } catch (writeError) {
      console.error("Error al guardar el archivo:", writeError);
      ctx.response.status = 500;
      ctx.response.body = { 
        error: "Error al guardar el archivo en el servidor", 
        details: writeError instanceof Error ? writeError.message : String(writeError)
      };
      return;
    }

    // Responder con información del archivo
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      file: {
        filename: fileName,
        originalName: file.name,
        path: `/uploads/${fileName}`, // Ruta relativa para el cliente
        type: file.type,
        size: fileContent.length
      }
    };

  } catch (err) {
    console.error("Error general al subir imagen:", err);
    ctx.response.status = 500;
    
    if (err instanceof Error) {
      ctx.response.body = { 
        error: "Error al procesar la subida de imagen", 
        details: err.message,
        stack: err.stack
      };
    } else {
      ctx.response.body = { 
        error: "Error al procesar la subida de imagen",
        details: String(err)
      };
    }
  }
  
  // No llamamos a next() porque ya enviamos una respuesta
}
