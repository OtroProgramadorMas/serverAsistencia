// deno-lint-ignore-file
// Utilities/imageUrls.ts

// Configuración base de la API
const API_BASE_URL = Deno.env.get("API_BASE_URL") || "http://localhost:8000";

/**
 * Construye una URL completa para una imagen
 * @param imagePath Ruta relativa de la imagen (ej: "/uploads/imagen.jpg")
 * @returns URL completa de la imagen
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "";
  
  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Asegurarse de que la ruta comience con /
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Middleware para servir archivos estáticos desde una carpeta
 * @param root Carpeta raíz para servir archivos
 * @returns Middleware de Oak
 */
export function serveStatic(root: string) {
  return async (ctx: any, next: () => Promise<unknown>) => {
    const path = ctx.request.url.pathname;
    
    // Si la ruta comienza con /uploads/ intenta servir el archivo
    if (path.startsWith("/uploads/")) {
      try {
        const filePath = `${root}${path}`;
        const fileInfo = await Deno.stat(filePath);
        
        if (fileInfo.isFile) {
          const content = await Deno.readFile(filePath);
          const contentType = getContentType(path);
          
          ctx.response.status = 200;
          ctx.response.headers.set("Content-Type", contentType);
          ctx.response.body = content;
          return;
        }
      } catch (error) {
        // Si hay error (archivo no existe, etc.), continuar con el siguiente middleware
        console.error(`Error al servir archivo ${path}:`, error);
      }
    }
    
    await next();
  };
}

// Función auxiliar para determinar el Content-Type basado en la extensión del archivo
function getContentType(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase();
  
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}