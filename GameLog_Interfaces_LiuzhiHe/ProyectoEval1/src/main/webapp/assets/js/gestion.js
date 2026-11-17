
const formulario = document.querySelector("#form-videojuego");
const botonGuardar = formulario.querySelector('button[type="submit"]');

const estadoFormulario = document.querySelector("#estado-formulario");
const filasVideojuegos = document.querySelector("#filas-videojuegos");
const estadoTabla = document.querySelector("#estado-tabla");

// Consultar los videojuegos guardados en MariaDB
async function cargarVideojuegos() {
    estadoTabla.textContent = "Cargando videojuegos…";

    try {
        const respuesta = await fetch("api/videojuegos", {
            headers: { Accept: "application/json" }
        });

        if (!respuesta.ok) {
            throw new Error("Error al consultar videojuegos");
        }

        const videojuegos = await respuesta.json();

        if (!Array.isArray(videojuegos)) {
            throw new Error("Respuesta incorrecta");
        }

        const filas = document.createDocumentFragment();

        for (const videojuego of videojuegos) {
            const fila = document.createElement("tr");

            const valores = [
                videojuego.titulo,
                videojuego.genero,
                videojuego.plataforma,
                videojuego.anio,
                videojuego.descripcion ?? "Sin descripción disponible"
            ];

            for (const valor of valores) {
                const celda = document.createElement("td");
                celda.textContent = valor;
                fila.append(celda);
            }


            const celdaAcciones = document.createElement("td");

            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.className = "button-eliminar";
            botonEliminar.textContent = "Eliminar";

            botonEliminar.setAttribute(
                "aria-label",
                `Eliminar ${videojuego.titulo} de ${videojuego.plataforma}`
            );

            botonEliminar.addEventListener("click", function () {
                eliminarVideojuego(
                    videojuego.id,
                    videojuego.titulo,
                    botonEliminar
                );
            });

            celdaAcciones.append(botonEliminar);
            fila.append(celdaAcciones);

            filas.append(fila);
        }

        filasVideojuegos.replaceChildren(filas);

        estadoTabla.textContent = videojuegos.length === 0
            ? "Todavía no hay videojuegos registrados."
            : "";

    } catch (error) {
        estadoTabla.textContent =
            "No se pudo cargar la biblioteca. Inténtalo de nuevo.";
    }
}


async function eliminarVideojuego(id, titulo, boton) {

    // Pedir confirmación antes de borrar
    const confirmar = window.confirm(
        `¿Seguro que quieres eliminar "${titulo}"?`
    );

    if (!confirmar) {
        return;
    }

    // Evitar pulsar varias veces mientras se elimina
    boton.disabled = true;
    estadoTabla.textContent = "Eliminando videojuego...";

    try {
        const respuesta = await fetch(
            `api/videojuegos?id=${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo eliminar el videojuego."
            );
        }

        // Consultar de nuevo la base de datos
        // y actualizar la tabla sin recargar la página
        await cargarVideojuegos();

    } catch (error) {
        estadoTabla.textContent =
            error.message || "Error al eliminar el videojuego.";

        boton.disabled = false;
    }
}


// Enviar un nuevo videojuego al servidor Java
formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    if (!formulario.reportValidity()) {
        return;
    }

    const titulo = formulario.elements.titulo.value.trim();

    if (titulo.length < 2) {
        estadoFormulario.textContent =
            "El título debe tener al menos dos caracteres.";
        return;
    }

    // Validar también el texto después de quitar espacios en los extremos
    const descripcion = formulario.elements.descripcion.value.trim();
    if (descripcion.length < 10 || descripcion.length > 1000) {
        estadoFormulario.textContent =
            "La descripción debe tener entre 10 y 1000 caracteres.";
        return;
    }

    // Recoger los cinco campos del formulario, incluida la descripción
    const datos = new URLSearchParams(new FormData(formulario));
    datos.set("titulo", titulo);
    datos.set("descripcion", descripcion);

    botonGuardar.disabled = true;
    estadoFormulario.textContent = "Guardando videojuego…";

    try {
        const respuesta = await fetch("api/videojuegos", {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: datos
        });

        let resultado = {};

        try {
            resultado = await respuesta.json();
        } catch {
            // El servidor no devolvió un JSON válido
        }

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo guardar el videojuego."
            );
        }

        // Solo limpiar el formulario si el guardado funciona
        formulario.reset();

        estadoFormulario.textContent =
            "Videojuego guardado correctamente.";

        // Actualizar la tabla sin recargar la página
        await cargarVideojuegos();

    } catch (error) {
        estadoFormulario.textContent =
            error.message || "Error de conexión con el servidor.";
    } finally {
        botonGuardar.disabled = false;
    }
});

// Cargar la biblioteca al abrir la página
if (window.location.protocol !== "file:") {
    cargarVideojuegos();
} else {
    botonGuardar.disabled = true;
    estadoTabla.textContent =
        "Abre GameLog desde Tomcat para consultar los videojuegos.";
}
