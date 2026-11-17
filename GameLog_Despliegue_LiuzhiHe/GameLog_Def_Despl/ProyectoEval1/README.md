# GameLog — Despliegue de Aplicaciones Web

## 1. Descripción

GameLog es una aplicación web para gestionar una biblioteca de videojuegos. El navegador muestra la interfaz HTML, CSS y JavaScript; las operaciones AJAX se comunican con un Servlet Java y este utiliza JDBC para consultar o modificar una base de datos MariaDB.

Este repositorio forma parte de la **segunda actividad de GameLog: despliegue en Ubuntu con Apache Tomcat y acceso desde otro equipo (Windows)**. La aplicación se publica en un **host virtual propio**, `gamelog.test`, sin sustituir el host `localhost` original de Tomcat.

## 2. Entorno utilizado

| Componente | Versión o dato de la práctica |
| --- | --- |
| Servidor | Ubuntu 24.04.5 LTS (máquina virtual VirtualBox) |
| Java | OpenJDK 21 |
| Servidor de aplicaciones | Apache Tomcat 10.1.60 |
| Base de datos | MariaDB 10.11.14 |
| Compilación | Maven |
| Puerto HTTP | `8080` |
| Nombre del host virtual | `gamelog.test` |
| Dirección IP utilizada durante la práctica | `10.10.0.146` (puede cambiar) |
| Equipo cliente | Windows con navegador web |

> **Nota:** `gamelog.test` es un nombre de uso local para esta práctica. No es un dominio público. La IP indicada corresponde al entorno de pruebas y debe actualizarse si cambia la red de la máquina virtual.

## 3. Contenido de la entrega

La estructura recomendada del ZIP es:

```text
Entrega_GameLog/
├── Memoria_GameLog.pdf
├── README.md
├── proyecto/                  # Código fuente, pom.xml y recursos
├── war/
│   └── gamelog.war
├── sql/
│   └── 01-gamelog-completo.sql
├── configuracion/             # Extractos de server.xml y configuración sin secretos
└── capturas/                  # Evidencias de las pruebas P01–P14
```

**Seguridad:** no se incluyen contraseñas, el archivo real `setenv.sh`, copias con credenciales, claves ni secretos en el ZIP.

## 4. Requisitos previos

1. Tener Ubuntu con Java 21, Maven, Apache Tomcat 10.1 y MariaDB instalados.
2. Tener Tomcat instalado en `/opt/tomcat` y ejecutándose con el usuario del sistema `tomcat`.
3. Permitir que el cliente Windows alcance el puerto TCP `8080` de Ubuntu.
4. Disponer del código fuente de GameLog y del archivo SQL suministrado.

Los comandos siguientes reflejan **la instalación utilizada en la práctica**. Si Tomcat está instalado en otra ubicación o administrado mediante `systemd`, los comandos de arranque y las rutas deberán adaptarse.

## 5. Preparar la base de datos

Desde la carpeta raíz del proyecto, ejecutar en Ubuntu:

```bash
sudo mariadb < sql/01-gamelog-completo.sql
```

Este script prepara la base de datos `gamelog` y los registros iniciales. Comprobar el resultado:

```bash
sudo mariadb -e "SELECT id, titulo, plataforma, anio FROM gamelog.videojuegos;"
```

En la práctica se utilizó un usuario de aplicación **distinto del administrador**: `gamelog_app` con acceso desde `127.0.0.1` y permisos limitados de `SELECT`, `INSERT` y `DELETE` sobre `gamelog.videojuegos`.

Si se recrea el entorno, crear ese usuario con una **contraseña nueva y segura**, conceder únicamente los permisos necesarios y no guardar la contraseña en este README ni en archivos que se entreguen públicamente. La creación del usuario requiere una cuenta administradora de MariaDB.

## 6. Configurar la conexión JDBC de Tomcat

En el servidor se configuró `/opt/tomcat/bin/setenv.sh` con estas variables de entorno:

```bash
export GAMELOG_DB_URL='jdbc:mariadb://127.0.0.1:3306/gamelog'
export GAMELOG_DB_USER='gamelog_app'
export GAMELOG_DB_PASSWORD='REEMPLAZAR_POR_CONTRASENA_PRIVADA'
```

El valor de ejemplo de `GAMELOG_DB_PASSWORD` **no es una contraseña real**. Debe reemplazarse localmente, sin incluirla en la entrega.

Para proteger el archivo:

```bash
sudo chown tomcat:tomcat /opt/tomcat/bin/setenv.sh
sudo chmod 600 /opt/tomcat/bin/setenv.sh
```

Estas variables se cargan cuando arranca Tomcat, por lo que es necesario reiniciarlo después de modificarlas.

## 7. Crear el host virtual `gamelog.test`

En `/opt/tomcat/conf/server.xml`, dentro del elemento `<Engine>` y junto al host original `localhost`, se añadió:

```xml
<Host name="gamelog.test"
      appBase="/opt/tomcat/sites/gamelog"
      unpackWARs="true"
      autoDeploy="true">
</Host>
```

Crear la carpeta del host y asignar su propiedad al usuario `tomcat`:

```bash
sudo mkdir -p /opt/tomcat/sites/gamelog
sudo chown -R tomcat:tomcat /opt/tomcat/sites/gamelog
```

**Importante:** no eliminar ni sustituir el `<Host name="localhost" ...>` que ya existe. Ambos hosts utilizan el mismo puerto `8080` y Tomcat los diferencia por el nombre solicitado.

## 8. Compilar y desplegar GameLog

Desde la raíz del proyecto Java (donde está `pom.xml`):

```bash
mvn clean package
```

La compilación genera `target/gamelog.war`. Copiarlo como `ROOT.war` al directorio del host virtual:

```bash
sudo cp target/gamelog.war /opt/tomcat/sites/gamelog/ROOT.war
sudo chown tomcat:tomcat /opt/tomcat/sites/gamelog/ROOT.war
```

El nombre `ROOT.war` permite acceder a GameLog directamente en `/`, sin añadir `/gamelog` a la URL.

En esta instalación de la práctica, Tomcat se administró mediante estos comandos:

```bash
sudo -u tomcat /opt/tomcat/bin/shutdown.sh
sudo -u tomcat /opt/tomcat/bin/startup.sh
```

Para revisar errores durante el despliegue:

```bash
sudo tail -n 100 /opt/tomcat/logs/catalina.out
```

## 9. Configurar el nombre `gamelog.test`

El nombre debe resolverse a la IP **actual** de Ubuntu.

### En Ubuntu

Consultar la IP:

```bash
ip -br addr
```

Añadir al archivo `/etc/hosts` una línea como esta (ajustando la IP si cambia):

```text
10.10.0.146 gamelog.test
```

### En Windows

Abrir como administrador el archivo:

```text
C:\Windows\System32\drivers\etc\hosts
```

Añadir la misma línea:

```text
10.10.0.146 gamelog.test
```

Guardar y comprobar desde PowerShell:

```powershell
ping gamelog.test
Test-NetConnection 10.10.0.146 -Port 8080
```

En `ping`, lo relevante es que el nombre se traduzca a la IP correcta; puede que el servidor no responda a ICMP.

## 10. Acceso y comprobaciones

Abrir desde Windows:

- **Aplicación:** `http://gamelog.test:8080/`
- **Gestión de videojuegos:** `http://gamelog.test:8080/gestion.html`
- **API de consulta:** `http://gamelog.test:8080/api/videojuegos`

Comprobaciones realizadas durante la práctica:

- Acceso desde Windows mediante el nombre `gamelog.test`.
- Consulta de videojuegos y carga dinámica de la tabla mediante AJAX.
- Inserción de un videojuego desde Windows y verificación del registro en MariaDB.
- Persistencia de los registros después de recargar la página y reiniciar Tomcat.
- Validación de campos obligatorios del formulario y rechazo HTTP `400` de una petición incorrecta enviada directamente al Servlet.
- Conservación de tildes y `ñ` en la aplicación y la base de datos.
- Acceso correcto a la página original de Tomcat desde `http://localhost:8080/` en Ubuntu.
- Prueba de navegación con teclado y vista móvil.
- Simulación y recuperación de un fallo de conexión a MariaDB.

Las capturas y el detalle de las pruebas **P01–P14** se documentan en la memoria del proyecto.

## 11. Incidencia reproducida y recuperación

**Fallo simulado:** se cambió temporalmente el puerto de conexión JDBC de `3306` a `3307` en el `setenv.sh` local y se reinició Tomcat. El HTML seguía cargando, pero la tabla de videojuegos mostraba un error porque no podía consultar MariaDB.

**Recuperación realizada:** se restauró la copia protegida de `setenv.sh`, se comprobaron sus permisos y se reinició Tomcat:

```bash
sudo cp /opt/tomcat/bin/setenv.sh.bak /opt/tomcat/bin/setenv.sh
sudo chown tomcat:tomcat /opt/tomcat/bin/setenv.sh
sudo chmod 600 /opt/tomcat/bin/setenv.sh
sudo -u tomcat /opt/tomcat/bin/shutdown.sh
sudo -u tomcat /opt/tomcat/bin/startup.sh
```

Al volver a entrar en `gestion.html`, la tabla recuperó los videojuegos guardados. La copia `setenv.sh.bak` es **privada del servidor** y **no debe incluirse** en el ZIP de entrega.

## 12. Vuelta a una versión anterior (rollback)

Antes de actualizar una aplicación conviene conservar una copia del WAR estable y del `server.xml` vigente. Si un nuevo despliegue falla:

1. Detener Tomcat.
2. Restaurar el `ROOT.war` estable en `/opt/tomcat/sites/gamelog/ROOT.war`.
3. Restaurar `server.xml` si también se modificó, tras comprobar que la copia es válida.
4. Reiniciar Tomcat y verificar la página, la API y la tabla.
5. Consultar `catalina.out` si el error persiste.

Este procedimiento se incluye como **plan de recuperación**; durante la práctica se comprobó efectivamente la recuperación de la conexión JDBC, pero no una restauración completa de una versión anterior del WAR. Restaurar un WAR **no revierte por sí solo** los cambios realizados en la base de datos.

## 13. Problemas frecuentes

| Problema | Qué comprobar |
| --- | --- |
| Windows no encuentra `gamelog.test` | Que `hosts` esté guardado sin extensión `.txt` y que contenga la IP actual |
| La IP del servidor ha cambiado | Ejecutar `ip -br addr` en Ubuntu y actualizar ambos archivos `hosts` |
| Windows no conecta al puerto `8080` | Conectividad de VirtualBox, red y `Test-NetConnection` |
| La web carga pero falla la tabla | Estado de MariaDB, puerto JDBC, permisos del usuario y logs de Tomcat |
| Se muestra la página original de Tomcat en vez de GameLog | Revisar la entrada `hosts`, el `<Host>` y la ubicación de `ROOT.war` |
| Tras editar `setenv.sh` nada cambia | Reiniciar Tomcat para cargar las variables nuevas |

## 14. Documentación

Consultar `Memoria_GameLog.pdf` para el desarrollo paso a paso, el registro de incidencias y las capturas de las pruebas.
