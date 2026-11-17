# GameLog

**Proyecto de Diseño de Interfaces Web (DIW)**  
Aplicación web para consultar y gestionar una pequeña biblioteca de videojuegos.

## 1. Descripción y público objetivo

GameLog está dirigido a personas interesadas en los videojuegos que quieran consultar información básica de distintos títulos y llevar un registro sencillo de su biblioteca.

El sitio dispone de cuatro páginas conectadas mediante un menú de navegación:

- **Inicio (`index.html`)**: presentación del proyecto y videojuegos destacados.
- **Catálogo (`catalogo.html`)**: muestra los videojuegos obtenidos de MariaDB mediante el servicio web; incluye enlaces a sus fichas.
- **Detalle (`detalle.html`)**: presenta título, género, plataforma, año y descripción del videojuego seleccionado.
- **Mi biblioteca (`gestion.html`)**: permite registrar videojuegos, consultar los existentes y eliminarlos con confirmación previa.

La interfaz es **responsive** y utiliza HTML semántico, CSS Grid/Flexbox, etiquetas de formularios y tablas accesibles. El catálogo, las fichas y la tabla se actualizan a partir de datos de MariaDB, no de una lista fija escrita en JavaScript.

## 2. Tecnologías y versiones

Versiones identificadas en el código y en la configuración del proyecto:

| Tecnología | Versión / uso |
| --- | --- |
| Java | **21**, configurado en `pom.xml` |
| Jakarta Servlet API | **6.0.0**, dependencia `provided` en Maven |
| Apache Tomcat | **11.0.x** en el entorno utilizado; también puede utilizarse **10.1.x** con Servlet 6.0 |
| MariaDB | **11.4** como versión de referencia del script SQL |
| MariaDB Connector/J | **3.5.11** |
| Gson | **2.15.0**, conversión entre objetos Java y JSON |
| Maven | Gestor de dependencias y compilación; versión del ejecutable no fijada en el proyecto |
| Maven Compiler Plugin | **3.14.1** |
| Maven WAR Plugin | **3.5.1** |
| HTML5, CSS y JavaScript | Estructura, diseño responsive y peticiones `fetch()` |

Las versiones de las dependencias Java están definidas en `pom.xml`. No se utiliza ningún framework de interfaz como Bootstrap.

## 3. Estructura del proyecto

```text
ProyectoEval1/
├── pom.xml
├── README.md
├── sql/
│   └── 01-gamelog-completo.sql
├── src/main/java/es/gamelog/
│   ├── ConexionBDMariaDB.java
│   ├── Videojuego.java
│   ├── VideojuegoDao.java
│   └── VideojuegoServlet.java
├── src/main/webapp/
│   ├── index.html
│   ├── catalogo.html
│   ├── detalle.html
│   ├── gestion.html
│   └── assets/
│       ├── css/estilos.css
│       ├── js/catalogo.js
│       ├── js/detalle.js
│       ├── js/gestion.js
│       ├── fonts/
│       └── img/
├── Documentacion/
│   ├── DEF_GameLog.pdf
│   └── wireframes/
└── Evidencias/
    ├── CASOS_PRUEBA_FORMULARIO.md
    └── REGISTRO_PRUEBAS.md
```

El **Servlet** recibe las peticiones HTTP, el **DAO** realiza consultas SQL mediante `PreparedStatement` y `ConexionBDMariaDB` obtiene la conexión utilizando variables de entorno.

## 4. Crear y configurar la base de datos

### 4.1. Crear la base y cargar los datos

1. Instalar e iniciar **MariaDB**.
2. Acceder a MariaDB con un usuario con permisos administrativos, por ejemplo `root`.
3. Abrir y ejecutar, de principio a fin, el archivo **`sql/01-gamelog-completo.sql`** desde IntelliJ, un cliente SQL o la consola de MariaDB.

En la consola de MariaDB puede utilizarse `SOURCE`, indicando la ruta real del archivo:

```sql
SOURCE C:/ruta/al/proyecto/sql/01-gamelog-completo.sql;
```

El script realiza estas operaciones:

- Crea la base de datos `gamelog` si no existe.
- Crea la tabla `videojuegos` con los campos `id`, `titulo`, `genero`, `plataforma`, `anio` y `descripcion`.
- Añade `descripcion` si la instalación anterior todavía no tenía esa columna.
- Añade un índice único sobre la combinación **`(titulo, plataforma)`**, para impedir duplicados en una misma plataforma.
- Inserta seis videojuegos de ejemplo: Elden Ring, Portal 2, Cyberpunk 2077, Hollow Knight, Hades y Minecraft, solo si todavía no existen para su plataforma.

**No es necesario borrar la base de datos para volver a ejecutar el script.** Los registros existentes se conservan. Si se ha eliminado alguno de los seis juegos de ejemplo, una nueva ejecución volverá a insertarlo. Si una base antigua ya tiene títulos/plataformas duplicados, habrá que resolverlos antes de crear el índice `UNIQUE`.

### 4.2. Crear el usuario de la aplicación y asignar permisos

Estas instrucciones **no están incluidas en el script principal** y deben ejecutarse con un usuario administrador de MariaDB:

```sql
CREATE USER IF NOT EXISTS 'gamelog_app'@'127.0.0.1'
    IDENTIFIED BY 'CAMBIAR_POR_UNA_CONTRASENA_PROPIA';

GRANT SELECT, INSERT, DELETE
ON gamelog.videojuegos
TO 'gamelog_app'@'127.0.0.1';
```

Se concede únicamente acceso para **consultar, insertar y eliminar** videojuegos. El usuario de la aplicación **no necesita ser `root`**. Sustituir la contraseña de ejemplo por una propia y no incluir contraseñas reales en el repositorio o ZIP.

Si `gamelog_app` ya existía, `CREATE USER IF NOT EXISTS` **no cambia su contraseña**; utilizar la contraseña previamente configurada o cambiarla expresamente desde una cuenta administradora.

Para verificar los datos y permisos:

```sql
SELECT id, titulo, genero, plataforma, anio, descripcion
FROM gamelog.videojuegos
ORDER BY id;

SHOW GRANTS FOR 'gamelog_app'@'127.0.0.1';
```

En una base de datos recién creada deberían aparecer **seis registros**.

## 5. Configurar la conexión desde Java

La clase `ConexionBDMariaDB.java` utiliza `System.getenv()` para leer tres variables de entorno:

| Variable | Valor de ejemplo |
| --- | --- |
| `GAMELOG_DB_URL` | `jdbc:mariadb://127.0.0.1:3306/gamelog` |
| `GAMELOG_DB_USER` | `gamelog_app` |
| `GAMELOG_DB_PASSWORD` | Contraseña configurada para ese usuario |

En **IntelliJ IDEA**:

1. Abrir **Run → Edit Configurations**.
2. Seleccionar la configuración de **Tomcat Server → Local**.
3. Introducir las variables en **Environment variables**.
4. Guardar la configuración y **reiniciar Tomcat**.

Si se inicia Tomcat fuera de IntelliJ, las variables deben estar disponibles en el entorno del **proceso que arranca Tomcat**. No hay que introducir las credenciales directamente en los archivos Java.

## 6. Compilar, desplegar y acceder al sitio

### 6.1. Compilar con Maven

Abrir una terminal en la carpeta **`ProyectoEval1`**, donde está `pom.xml`, y ejecutar:

```bash
mvn clean package
```

Maven compila las clases Java, incluye las dependencias necesarias y genera:

```text
target/gamelog.war
```

El archivo WAR es el paquete que se despliega en el servidor Tomcat.

### 6.2. Desplegar en Tomcat

Se puede utilizar cualquiera de estos procedimientos:

- **Tomcat instalado:** copiar `target/gamelog.war` a la carpeta `webapps/` del servidor y arrancar Tomcat. El contexto habitual será `/gamelog`.
- **IntelliJ IDEA:** configurar Tomcat y desplegar el artefacto **WAR exploded**. El contexto puede ser `/gamelog_war_exploded`, según la configuración.

### 6.3. Direcciones de acceso

Con Tomcat en el puerto **8080** y contexto `/gamelog`:

| Página | URL |
| --- | --- |
| Inicio | `http://localhost:8080/gamelog/index.html` |
| Catálogo | `http://localhost:8080/gamelog/catalogo.html` |
| Detalle | `http://localhost:8080/gamelog/detalle.html?id=1` |
| Mi biblioteca | `http://localhost:8080/gamelog/gestion.html` |
| API | `http://localhost:8080/gamelog/api/videojuegos` |

El identificador `id=1` es un ejemplo; debe existir en la base de datos. La ficha también acepta enlaces antiguos como `detalle.html?juego=elden-ring` y, si se abre sin parámetros, muestra el primer registro disponible.

Si se utiliza WAR exploded con contexto `/gamelog_war_exploded`, sustituir `/gamelog/` por `/gamelog_war_exploded/` en las URL. **No abrir las páginas como `file://`**, porque las consultas a la API necesitan que Tomcat esté iniciado.

## 7. Rutas del servicio web y ejemplos JSON

El servicio está implementado en `VideojuegoServlet.java` y publicado mediante `@WebServlet("/api/videojuegos")`. Todos los métodos responden en **JSON**. La ruta se interpreta respecto al contexto de la aplicación.

### GET `/api/videojuegos`

Consulta todos los videojuegos de MariaDB y devuelve **200 OK** con un array JSON:

```json
[
  {
    "id": 1,
    "titulo": "Elden Ring",
    "genero": "Rol",
    "plataforma": "PC",
    "anio": 2022,
    "descripcion": "Explora las Tierras Intermedias y enfréntate a distintos desafíos."
  }
]
```

Este JSON es un **ejemplo de formato**: el contenido y los identificadores reales dependen de la base de datos. Si no hay registros, se devuelve `[]`. Si falla la consulta, se devuelve **500**:

```json
{"error":"No se pudo consultar la biblioteca."}
```

**No existe un endpoint GET específico por identificador**: `detalle.js` obtiene la lista completa y selecciona el registro solicitado por su `id`.

### POST `/api/videojuegos`

Registra un videojuego nuevo. El navegador envía los cinco campos mediante `fetch()` y `URLSearchParams`, en formato **`application/x-www-form-urlencoded`** (no como JSON de entrada):

```text
titulo=Celeste&genero=Aventura&plataforma=PC&anio=2018&descripcion=Una+aventura+de+plataformas+en+una+montaña+nevada.
```

La respuesta correcta es **201 Created**:

```json
{"mensaje":"Videojuego guardado correctamente."}
```

El Servlet también puede devolver:

| Código HTTP | Situación | Ejemplo de JSON |
| --- | --- | --- |
| `400 Bad Request` | Faltan datos o no superan la validación | `{"error":"Datos no válidos."}` |
| `400 Bad Request` | Año no numérico o ausente | `{"error":"El año no es válido."}` |
| `400 Bad Request` | Descripción fuera de los límites | `{"error":"La descripción debe tener entre 10 y 1000 caracteres."}` |
| `409 Conflict` | Ya existe el título en la misma plataforma | `{"error":"Ya tienes este videojuego registrado en esa plataforma."}` |
| `500 Internal Server Error` | Error de base de datos al insertar | `{"error":"No se pudo guardar el videojuego."}` |

**Validación del POST:** título de 2 a 100 caracteres; género y plataforma entre las opciones permitidas; año comprendido entre 1950 y el año actual; descripción obligatoria de 10 a 1000 caracteres después de retirar espacios exteriores. El índice `UNIQUE` de MariaDB impide duplicar un mismo título y plataforma, pero permite el mismo título en plataformas distintas.

### DELETE `/api/videojuegos?id=N`

Elimina el registro cuyo identificador sea `N`. Se realiza desde **Mi biblioteca**, después de mostrar una confirmación al usuario. Ejemplo de ruta:

```text
DELETE /gamelog/api/videojuegos?id=15
```

Si se elimina correctamente devuelve **200 OK**:

```json
{"mensaje":"Videojuego eliminado correctamente."}
```

Posibles errores:

- **400:** `{"error":"El ID del videojuego no es válido."}`
- **404:** `{"error":"El videojuego no existe."}`
- **500:** `{"error":"No se pudo eliminar el videojuego."}`

Tras una inserción o eliminación correcta, JavaScript vuelve a consultar el servicio y **actualiza la tabla sin recargar la página**.

## 8. Cómo ejecutar las pruebas

El proyecto incluye pruebas **manuales** documentadas en:

- `Evidencias/CASOS_PRUEBA_FORMULARIO.md`: casos de prueba del formulario y de la API.
- `Evidencias/REGISTRO_PRUEBAS.md`: registro para anotar resultados y evidencias.

No hay pruebas unitarias JUnit ni archivos de test automatizados en `src/test`. Por tanto, la compilación de Maven **no equivale a haber superado las pruebas funcionales**.

### Pruebas desde el navegador

1. Iniciar MariaDB y Tomcat y abrir GameLog desde su URL HTTP.
2. Entrar en **Catálogo** y comprobar que aparecen los seis videojuegos y que sus fichas se abren desde **Detalle**.
3. En **Mi biblioteca**, añadir un juego de prueba válido y comprobar que aparece en la tabla sin recargar la página.
4. Intentar registrarlo de nuevo con el mismo título y plataforma: debe aparecer el error de duplicado (**409**). Una plataforma diferente sí debe permitirlo.
5. Probar valores incorrectos: título vacío o demasiado corto, año fuera de rango, descripción de menos de 10 o más de 1000 caracteres. El navegador debe impedir envíos inválidos.
6. Eliminar **solo un videojuego de prueba**, confirmar el aviso y comprobar que desaparece de la tabla y del catálogo. Cancelar otro borrado para verificar que no se elimina.
7. Abrir las herramientas de Chrome (**F12 → Network → Fetch/XHR**) para observar las peticiones y sus códigos HTTP: **GET 200, POST 201, POST 400/409 y DELETE 200/404** cuando corresponda.
8. Comprobar las cuatro páginas en móvil, tableta y escritorio (por ejemplo, anchos de **375, 768 y 1366 píxeles**), además de navegación con teclado, mensajes de error y desplazamiento horizontal limitado a la tabla.

### Pruebas directas de la API (Windows PowerShell)

Consultar videojuegos:

```powershell
curl.exe -i "http://localhost:8080/gamelog/api/videojuegos"
```

Comprobar validación de la descripción (menos de 10 caracteres, debe devolver **400**):

```powershell
curl.exe -i -X POST "http://localhost:8080/gamelog/api/videojuegos" `
  --data-urlencode "titulo=Prueba API" `
  --data-urlencode "genero=Aventura" `
  --data-urlencode "plataforma=PC" `
  --data-urlencode "anio=2022" `
  --data-urlencode "descripcion=Corta"
```

Para probar DELETE, crear primero un juego temporal y localizar su `id` mediante GET. Después sustituir **`N`** por ese identificador:

```powershell
curl.exe -i -X DELETE "http://localhost:8080/gamelog/api/videojuegos?id=N"
```

Para verificar la persistencia en MariaDB:

```sql
SELECT id, titulo, genero, plataforma, anio, descripcion
FROM gamelog.videojuegos
ORDER BY id;
```

Los casos definidos en `Evidencias/` son instrucciones para ejecutar y registrar: **no deben marcarse como superados si no se han probado realmente**. También pueden realizarse comprobaciones con [Nu Html Checker](https://validator.w3.org/nu/) y Lighthouse, registrando sus resultados.

## 9. Limitaciones conocidas

- **No hay autenticación ni cuentas de usuario.** GameLog es un proyecto educativo para ejecución local; cualquiera que pueda acceder al servicio puede intentar insertar o eliminar registros. No debe publicarse en Internet sin implementar controles de acceso.
- **No permite editar registros** ya guardados. Sí permite consultar, añadir y eliminar.
- **No permite subir portadas.** Los seis títulos de ejemplo usan imágenes locales y los videojuegos nuevos muestran una portada genérica.
- **El detalle no tiene un GET independiente por ID**: consulta el listado completo y busca el registro en JavaScript.
- **El año máximo del formulario HTML es 2026**, aunque el Servlet valida el año actual dinámicamente; si se utiliza el sitio en años posteriores habrá que actualizar el atributo `max` del formulario.
- Los géneros de los ejemplos iniciales incluyen **Puzles** y **Sandbox**, mientras que el formulario de alta ofrece un conjunto más reducido de opciones.
- Los registros antiguos podrían no tener descripción. El catálogo y el detalle muestran un texto alternativo si falta ese dato.
- La tabla de Mi biblioteca necesita desplazamiento horizontal interno en pantallas estrechas para mantener legibles sus columnas.
- Una base de datos preexistente con duplicados de título/plataforma necesita corregirlos antes de crear el índice único.

## 10. Recursos externos y licencias

- **Imágenes de videojuegos:** imágenes locales incluidas en `src/main/webapp/assets/img/`, atribuidas en el material del proyecto a recursos promocionales y páginas de los videojuegos: [Elden Ring](https://store.steampowered.com/app/1245620/ELDEN_RING/), [Portal 2](https://store.steampowered.com/app/620/Portal_2/), [Cyberpunk 2077](https://store.steampowered.com/app/1091500/Cyberpunk_2077/), [Hollow Knight](https://store.steampowered.com/app/367520/Hollow_Knight/), [Hades](https://store.steampowered.com/app/1145360/Hades/) y [Minecraft](https://www.minecraft.net/). Los derechos de estas imágenes y marcas pertenecen a sus titulares; su inclusión tiene finalidad académica. Los enlaces indican las fuentes referenciadas en el proyecto, no una licencia de reutilización.
- **Fuente tipográfica:** [DM Sans](https://fonts.google.com/specimen/DM+Sans), incluida de forma local. Su licencia está en `src/main/webapp/assets/fonts/OFL.txt`.
- **Librerías Java:** [Gson](https://github.com/google/gson), [MariaDB Connector/J](https://mariadb.com/kb/en/about-mariadb-connector-j/) y [Jakarta Servlet](https://jakarta.ee/specifications/servlet/), descargadas y gestionadas mediante Maven según `pom.xml`.
- **Tecnologías de servidor:** [Apache Tomcat](https://tomcat.apache.org/) y [Apache Maven](https://maven.apache.org/).

## 11. Documentación de la entrega

La carpeta `Documentacion/` contiene el documento de especificación funcional (DEF), sus anexos y los wireframes. La carpeta `Evidencias/` contiene el diseño de casos de prueba y el registro de resultados.

Para una entrega limpia se recomienda incluir **código fuente, `pom.xml`, SQL, `README.md`, documentación, evidencias y `target/gamelog.war` si se solicita el WAR**. No es necesario entregar archivos personales de IntelliJ (`.idea/`) ni el resto de archivos temporales de `target/`. Especialmente, deben revisarse y excluirse configuraciones locales que puedan contener información de conexión.
