
package es.gamelog;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

final class VideojuegoDao {

    // Objeto encargado de abrir conexiones con MariaDB
    private final ConexionBDMariaDB baseDatos = new ConexionBDMariaDB();

    private static final String CONSULTA = """
            SELECT id, titulo, genero, plataforma, anio, descripcion
            FROM videojuegos
            ORDER BY id
            """;

    // Consultar todos los videojuegos
    List<Videojuego> listar() throws SQLException {
        List<Videojuego> videojuegos = new ArrayList<>();

        try (Connection conexion = baseDatos.abrir();
             PreparedStatement consulta = conexion.prepareStatement(CONSULTA);
             ResultSet filas = consulta.executeQuery()) {

            while (filas.next()) {
                videojuegos.add(new Videojuego(
                        filas.getInt("id"),
                        filas.getString("titulo"),
                        filas.getString("genero"),
                        filas.getString("plataforma"),
                        filas.getInt("anio"),
                        filas.getString("descripcion")
                ));
            }
        }

        return videojuegos;
    }

    // Insertar un videojuego
    void insertar(String titulo, String genero,
                  String plataforma, int anio, String descripcion) throws SQLException {

        String sql = """
                INSERT INTO videojuegos (titulo, genero, plataforma, anio, descripcion)
                VALUES (?, ?, ?, ?, ?)
                """;

        try (Connection conexion = baseDatos.abrir();
             PreparedStatement consulta = conexion.prepareStatement(sql)) {

            consulta.setString(1, titulo);
            consulta.setString(2, genero);
            consulta.setString(3, plataforma);
            consulta.setInt(4, anio);
            consulta.setString(5, descripcion);

            consulta.executeUpdate();
        }
    }


    // Eliminar un videojuego por su identificador
    boolean eliminar(int id) throws SQLException {

        String sql = "DELETE FROM videojuegos WHERE id = ?";

        try (Connection conexion = baseDatos.abrir();
             PreparedStatement consulta = conexion.prepareStatement(sql)) {

            consulta.setInt(1, id);

            int filasEliminadas = consulta.executeUpdate();

            return filasEliminadas > 0;
        }
    }
}
