// Las tarjetas se obtienen de la base de datos mediante el Servlet Java.
const catalogo = document.querySelector("#catalogo-dinamico");
const estadoCatalogo = document.querySelector("#estado-catalogo");

// Las portadas son recursos locales. Los textos y datos proceden de MariaDB.
const recursosDestacados = {
    "elden ring": {
        imagen: "elden-ring.jpg"
    },
    "portal 2": {
        imagen: "portal-2.jpg"
    },
    "cyberpunk 2077": {
        imagen: "cyberpunk-2077.jpg"
    },
    "hollow knight": {
        imagen: "hollow-knight.jpg"
    },
    "hades": {
        imagen: "hades.jpg"
    },
    "minecraft": {
        imagen: "minecraft.jpg"
    }
};

function crearTarjeta(juego, posicion) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "game-card";

    const recursos = recursosDestacados[juego.titulo.trim().toLocaleLowerCase("es")];

    if (recursos) {
        const imagen = document.createElement("img");
        imagen.src = "assets/img/" + recursos.imagen;
        imagen.alt = ""; // Decorativa: el título aparece como texto en la tarjeta.
        imagen.width = 460;
        imagen.height = 215;
        if (posicion > 1) imagen.loading = "lazy";
        tarjeta.append(imagen);
    } else {
        const portada = document.createElement("div");
        portada.className = "game-card-placeholder";
        portada.textContent = "🎮";
        portada.setAttribute("aria-hidden", "true");
        tarjeta.append(portada);
    }

    const contenido = document.createElement("div");
    contenido.className = "game-card-body";

    const titulo = document.createElement("h2");
    titulo.textContent = juego.titulo;

    const metadatos = document.createElement("p");
    metadatos.className = "game-meta";
    metadatos.textContent = juego.genero + " · " + juego.plataforma;

    const descripcion = document.createElement("p");
    // La descripción procede de MariaDB para TODOS los videojuegos.
    const texto = typeof juego.descripcion === "string"
        ? juego.descripcion.trim() : "";
    descripcion.textContent = texto.length > 175
        ? texto.slice(0, 172) + "…"
        : (texto || "Descripción todavía no disponible.");

    const enlace = document.createElement("a");
    enlace.className = "text-link";
    enlace.href = "detalle.html?id=" + encodeURIComponent(juego.id);
    enlace.textContent = "Ver ficha de " + juego.titulo + " →";

    contenido.append(titulo, metadatos, descripcion, enlace);
    tarjeta.append(contenido);
    return tarjeta;
}

async function cargarCatalogo() {
    estadoCatalogo.textContent = "Cargando videojuegos…";

    try {
        const respuesta = await fetch("api/videojuegos", {
            headers: { Accept: "application/json" }
        });
        if (!respuesta.ok) throw new Error("No se pudo consultar el servicio.");

        const videojuegos = await respuesta.json();
        if (!Array.isArray(videojuegos)) throw new Error("Respuesta incorrecta.");

        const tarjetas = document.createDocumentFragment();
        videojuegos.forEach((juego, indice) => {
            tarjetas.append(crearTarjeta(juego, indice));
        });

        // Solo reemplazar las tarjetas después de recibir datos válidos.
        catalogo.replaceChildren(tarjetas);
        estadoCatalogo.textContent = videojuegos.length === 0
            ? "Todavía no hay videojuegos registrados. Añade uno en Mi biblioteca."
            : "";
    } catch (error) {
        estadoCatalogo.textContent =
            "No se pudo cargar el catálogo. Comprueba la conexión con el servidor.";
    }
}

cargarCatalogo();
