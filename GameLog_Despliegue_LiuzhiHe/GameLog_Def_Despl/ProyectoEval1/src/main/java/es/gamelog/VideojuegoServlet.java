package es.gamelog;

import java.time.Year;
import java.util.Set;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.Map;

@WebServlet("/api/videojuegos")
public class VideojuegoServlet extends HttpServlet {
    private final VideojuegoDao videojuegos = new VideojuegoDao();
    private final Gson json = new Gson();


    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response) throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("Cache-Control", "no-store");

        String contenido;

        try {
            contenido = json.toJson(videojuegos.listar());

        } catch (SQLException error) {
            getServletContext().log(
                    "Error al consultar la biblioteca. SQLState: "
                            + error.getSQLState()
            );

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            contenido = json.toJson(Map.of(
                    "error", "No se pudo consultar la biblioteca."
            ));
        }

        response.getWriter().write(contenido);
    }



    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response) throws IOException {

        // Preparar la codificación y la respuesta JSON
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Recibir los datos enviados desde el formulario
        String titulo = request.getParameter("titulo");
        String genero = request.getParameter("genero");
        String plataforma = request.getParameter("plataforma");
        String anioTexto = request.getParameter("anio");
        String descripcion = request.getParameter("descripcion");

        // Comprobar el año
        int anio;
        try {
            anio = Integer.parseInt(anioTexto);
        } catch (NumberFormatException error) {
            response.setStatus(400);
            response.getWriter().write(
                    json.toJson(Map.of("error", "El año no es válido."))
            );
            return;
        }

        // La descripción es obligatoria, también si se llama al Servlet directamente
        if (descripcion == null || descripcion.strip().length() < 10
                || descripcion.strip().length() > 1000) {
            response.setStatus(400);
            response.getWriter().write(
                    json.toJson(Map.of("error",
                            "La descripción debe tener entre 10 y 1000 caracteres."))
            );
            return;
        }

        // Comprobar los datos recibidos
        if (titulo == null || titulo.strip().length() < 2
                || titulo.strip().length() > 100
                || genero == null
                || !Set.of("Acción", "Aventura", "Rol",
                "Estrategia", "Simulación", "Deportes",
                "Otros").contains(genero)
                || plataforma == null
                || !Set.of("PC", "PlayStation", "Xbox",
                "Nintendo Switch", "Otra").contains(plataforma)
                || anio < 1950 || anio > Year.now().getValue()) {

            response.setStatus(400);
            response.getWriter().write(
                    json.toJson(Map.of("error", "Datos no válidos."))
            );
            return;
        }

        // Guardar el videojuego en MariaDB
        try {
            videojuegos.insertar(
                    titulo.strip(), genero, plataforma, anio, descripcion.strip()
            );

            response.setStatus(201);
            response.getWriter().write(
                    json.toJson(Map.of(
                            "mensaje", "Videojuego guardado correctamente."
                    ))
            );

        } catch (SQLException error) {

            // Error 1062: ya existe el título en esa plataforma
            if (error.getErrorCode() == 1062) {
                response.setStatus(409);
                response.getWriter().write(
                        json.toJson(Map.of(
                                "error", "Ya tienes este videojuego registrado en esa plataforma."
                        ))
                );
                return;
            }

            // Otros errores de MariaDB
            getServletContext().log(
                    "Error al insertar un videojuego. SQLState: "
                            + error.getSQLState()
            );

            response.setStatus(500);
            response.getWriter().write(
                    json.toJson(Map.of(
                            "error", "No se pudo guardar el videojuego."
                    ))
            );
        }
    }


    @Override
    protected void doDelete(HttpServletRequest request,
                            HttpServletResponse response) throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Obtener el ID que envía JavaScript
        String idTexto = request.getParameter("id");

        int id;

        // Comprobar que el ID es un número
        try {
            id = Integer.parseInt(idTexto);
        } catch (NumberFormatException error) {
            response.setStatus(400);
            response.getWriter().write(
                    json.toJson(Map.of(
                            "error", "El ID del videojuego no es válido."
                    ))
            );
            return;
        }

        // Intentar eliminar el videojuego
        try {
            boolean eliminado = videojuegos.eliminar(id);

            if (eliminado) {
                response.setStatus(200);
                response.getWriter().write(
                        json.toJson(Map.of(
                                "mensaje", "Videojuego eliminado correctamente."
                        ))
                );
            } else {
                response.setStatus(404);
                response.getWriter().write(
                        json.toJson(Map.of(
                                "error", "El videojuego no existe."
                        ))
                );
            }

        } catch (SQLException error) {
            getServletContext().log(
                    "Error al eliminar un videojuego.", error
            );

            response.setStatus(500);
            response.getWriter().write(
                    json.toJson(Map.of(
                            "error", "No se pudo eliminar el videojuego."
                    ))
            );
        }
    }

}
