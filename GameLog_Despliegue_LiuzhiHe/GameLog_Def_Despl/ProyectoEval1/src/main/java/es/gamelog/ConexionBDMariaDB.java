
package es.gamelog;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionBDMariaDB {

    public Connection abrir() throws SQLException {

        String url = System.getenv("GAMELOG_DB_URL");
        String usuario = System.getenv("GAMELOG_DB_USER");
        String clave = System.getenv("GAMELOG_DB_PASSWORD");

        if (url == null || url.isBlank()
                || usuario == null || usuario.isBlank()
                || clave == null) {
            throw new SQLException("Falta configurar MariaDB.");
        }

        try {
            Class.forName("org.mariadb.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("No se encuentra el driver de MariaDB.", e);
        }

        return DriverManager.getConnection(url, usuario, clave);
    }
}
