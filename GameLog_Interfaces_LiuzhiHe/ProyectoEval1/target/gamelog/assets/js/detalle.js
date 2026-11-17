// El detalle utiliza los mismos registros de MariaDB que el catálogo.
// Las imágenes son locales; la descripción de cada juego llega de MariaDB.
const recursosFicha = {
    "elden ring": {
        portada: "elden-ring-detalle.jpg",
        alt: "Un guerrero arrodillado bajo el símbolo dorado del Círculo de Elden.",
        ancho: 300, alto: 450
    },
    "portal 2": {
        portada: "portal-2.jpg",
        alt: "Un robot salta entre un portal azul y otro naranja.",
        ancho: 460, alto: 215
    },
    "cyberpunk 2077": {
        portada: "cyberpunk-2077.jpg",
        alt: "V de espaldas ante una silueta urbana amarilla.",
        ancho: 460, alto: 215
    },
    "hollow knight": {
        portada: "hollow-knight.jpg",
        alt: "El pequeño caballero de máscara blanca en una caverna azul.",
        ancho: 460, alto: 215
    },
    "hades": {
        portada: "hades.jpg",
        alt: "Zagreo empuña una espada con el inframundo al fondo.",
        ancho: 460, alto: 215
    },
    "minecraft": {
        portada: "minecraft.jpg",
        alt: "Steve y Alex recorren un paisaje de bloques con animales y criaturas.",
        ancho: 1170, alto: 500
    }
};

const estadoDetalle = document.querySelector("#estado-detalle");
const fichaNoEncontrada = document.querySelector("#ficha-no-encontrada");

function mostrarFicha(juego) {
    const plantilla = document.querySelector("#plantilla-ficha");
    const ficha = plantilla.content.cloneNode(true);
    const recursos = recursosFicha[juego.titulo.trim().toLocaleLowerCase("es")];
    const portada = ficha.querySelector(".detail-cover");

    if (recursos) {
        portada.src = "assets/img/" + recursos.portada;
        portada.alt = recursos.alt;
        portada.width = recursos.ancho;
        portada.height = recursos.alto;
    } else {
        // Los juegos insertados desde el formulario no tienen imagen subida.
        const generica = document.createElement("div");
        generica.className = "detail-cover-placeholder";
        generica.textContent = "🎮";
        generica.setAttribute("aria-hidden", "true");
        portada.replaceWith(generica);
    }

    ficha.querySelector("[data-titulo]").textContent = juego.titulo;
    ficha.querySelector("[data-genero]").textContent = juego.genero;
    ficha.querySelector("[data-plataforma]").textContent = juego.plataforma;
    ficha.querySelector("[data-anio]").textContent = juego.anio;
    // No duplicar textos en JavaScript: siempre consultar la descripción del registro.
    ficha.querySelector("[data-descripcion]").textContent =
        (typeof juego.descripcion === "string" && juego.descripcion.trim())
            ? juego.descripcion
            : "Descripción todavía no disponible para este videojuego.";

    document.title = juego.titulo + " | GameLog";
    plantilla.before(ficha);
}

async function cargarDetalle() {
    try {
        const respuesta = await fetch("api/videojuegos", {
            headers: { Accept: "application/json" }
        });
        if (!respuesta.ok) throw new Error("No se pudo consultar el servicio.");
        const videojuegos = await respuesta.json();
        if (!Array.isArray(videojuegos)) throw new Error("Respuesta incorrecta.");

        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get("id");
        const juegoAntiguo = parametros.get("juego");
        let seleccionado;

        if (id !== null) {
            seleccionado = /^-?\d+$/.test(id)
                ? videojuegos.find(juego => juego.id === Number(id))
                : undefined;
        } else if (juegoAntiguo) {
            // Compatibilidad con enlaces antiguos: detalle.html?juego=elden-ring
            seleccionado = videojuegos.find(juego =>
                juego.titulo.trim().toLocaleLowerCase("es").replaceAll(" ", "-")
                === juegoAntiguo
            );
        } else {
            // Menú «Detalle»: mostrar un juego si no se ha seleccionado ninguno.
            seleccionado = videojuegos[0];
        }

        estadoDetalle.textContent = "";
        if (seleccionado) {
            mostrarFicha(seleccionado);
        } else {
            document.title = "Ficha no encontrada | GameLog";
            fichaNoEncontrada.hidden = false;
        }
    } catch (error) {
        estadoDetalle.textContent =
            "No se pudo cargar la ficha. Comprueba la conexión con el servidor.";
        fichaNoEncontrada.hidden = false;
    }
}

cargarDetalle();
