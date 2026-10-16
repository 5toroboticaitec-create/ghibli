
const API_URL = "https://ghibliapi.dev/films";

const contenedorPeliculas = document.getElementById("peliculas");
const busqueda = document.getElementById("busqueda");
const filtroDirector = document.getElementById("filtroDirector");
const contador = document.getElementById("contador");
const estado = document.getElementById("estado");

const modal = document.getElementById("modal");
const cerrarModal = document.getElementById("cerrarModal");

let todasLasPeliculas = [];

// Algunos títulos habituales en español.
const titulosEspanol = {
    "Castle in the Sky": "El castillo en el cielo",
    "Grave of the Fireflies": "La tumba de las luciérnagas",
    "My Neighbor Totoro": "Mi vecino Totoro",
    "Kiki's Delivery Service": "Nicky, la aprendiz de bruja",
    "Only Yesterday": "Recuerdos del ayer",
    "Porco Rosso": "Porco Rosso",
    "Pom Poko": "Pompoko",
    "Whisper of the Heart": "Susurros del corazón",
    "Princess Mononoke": "La princesa Mononoke",
    "My Neighbors the Yamadas": "Mis vecinos los Yamada",
    "Spirited Away": "El viaje de Chihiro",
    "The Cat Returns": "Haru en el reino de los gatos",
    "Howl's Moving Castle": "El castillo ambulante",
    "Tales from Earthsea": "Cuentos de Terramar",
    "Ponyo": "Ponyo en el acantilado",
    "Arrietty": "Arrietty y el mundo de los diminutos",
    "From Up on Poppy Hill": "La colina de las amapolas",
    "The Wind Rises": "El viento se levanta",
    "The Tale of the Princess Kaguya": "El cuento de la princesa Kaguya",
    "When Marnie Was There": "El recuerdo de Marnie",
    "The Red Turtle": "La tortuga roja",
    "Earwig and the Witch": "Aya y la bruja",
    "The Boy and the Heron": "El chico y la garza"
};

function tituloVisible(titulo) {
    return titulosEspanol[titulo] || titulo;
}

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

async function cargarPeliculas() {
    estado.textContent = "Cargando películas...";
    contenedorPeliculas.innerHTML = "";

    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el catálogo.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
            throw new Error("La API devolvió un formato inesperado.");
        }

        todasLasPeliculas = datos;

        cargarDirectores();
        aplicarFiltros();
    } catch (error) {
        estado.textContent =
            "No se pudieron cargar las películas. Revisá tu conexión a internet e intentá nuevamente.";
        contador.textContent = "Sin resultados";
    }
}

function cargarDirectores() {
    const directores = [...new Set(
        todasLasPeliculas
            .map(pelicula => pelicula.director)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    filtroDirector.innerHTML =
        '<option value="">Todos los directores</option>';

    directores.forEach(director => {
        const opcion = document.createElement("option");
        opcion.value = director;
        opcion.textContent = director;
        filtroDirector.appendChild(opcion);
    });
}

function aplicarFiltros() {
    const texto = busqueda.value.trim().toLocaleLowerCase();
    const directorSeleccionado = filtroDirector.value;

    const resultados = todasLasPeliculas.filter(pelicula => {
        const tituloOriginal = (pelicula.title || "").toLocaleLowerCase();
        const tituloTraducido = tituloVisible(pelicula.title || "")
            .toLocaleLowerCase();

        const coincideTitulo =
            tituloOriginal.includes(texto) ||
            tituloTraducido.includes(texto);

        const coincideDirector =
            !directorSeleccionado ||
            pelicula.director === directorSeleccionado;

        return coincideTitulo && coincideDirector;
    });

    mostrarPeliculas(resultados);
}

function mostrarPeliculas(peliculas) {
    contenedorPeliculas.innerHTML = "";

    contador.textContent =
        `${peliculas.length} ${peliculas.length === 1 ? "película" : "películas"}`;

    estado.textContent = peliculas.length
        ? ""
        : "No encontramos películas con esos filtros. Probá otra búsqueda.";

    peliculas.forEach(pelicula => {
        const tarjeta = crearElemento("article", "tarjeta");

        if (pelicula.image) {
            const imagen = crearElemento("img", "poster");
            imagen.src = pelicula.image;
            imagen.alt = `Póster de ${tituloVisible(pelicula.title)}`;
            imagen.loading = "lazy";

            imagen.onerror = () => {
                const reemplazo = crearElemento(
                    "div",
                    "poster-sin-imagen",
                    "🎬"
                );
                reemplazo.setAttribute("aria-label", "Póster no disponible");
                imagen.replaceWith(reemplazo);
            };

            tarjeta.appendChild(imagen);
        } else {
            tarjeta.appendChild(
                crearElemento("div", "poster-sin-imagen", "🎬")
            );
        }

        const info = crearElemento("div", "tarjeta-info");
        const titulo = crearElemento(
            "h3",
            "",
            tituloVisible(pelicula.title || "Película sin título")
        );

        const director = crearElemento("p", "detalle-linea");
        director.append(
            crearElemento("strong", "", "Director: "),
            document.createTextNode(pelicula.director || "No disponible")
        );

        const anio = crearElemento("p", "detalle-linea");
        anio.append(
            crearElemento("strong", "", "Año: "),
            document.createTextNode(pelicula.release_date || "No disponible")
        );

        const boton = crearElemento("button", "boton boton-verde", "Ver ficha");
        boton.type = "button";
        boton.addEventListener("click", () => abrirFicha(pelicula));

        info.append(titulo, director, anio, boton);
        tarjeta.appendChild(info);
        contenedorPeliculas.appendChild(tarjeta);
    });
}

function abrirFicha(pelicula) {
    document.getElementById("modalTitulo").textContent =
        tituloVisible(pelicula.title || "Película sin título");

    document.getElementById("modalDirector").textContent =
        pelicula.director || "No disponible";

    document.getElementById("modalAnio").textContent =
        pelicula.release_date || "No disponible";

    document.getElementById("modalDuracion").textContent =
        pelicula.running_time
            ? `${pelicula.running_time} minutos`
            : "No disponible";

    document.getElementById("modalPuntuacion").textContent =
        pelicula.rt_score
            ? `${pelicula.rt_score}/100`
            : "No disponible";

    document.getElementById("modalSinopsis").textContent =
        pelicula.description || "No hay una sinopsis disponible.";

    const imagen = document.getElementById("modalImagen");

    imagen.onerror = () => {
        imagen.classList.add("oculto");
    };

    if (pelicula.image) {
        imagen.src = pelicula.image;
        imagen.alt = `Póster de ${tituloVisible(pelicula.title)}`;
        imagen.classList.remove("oculto");
    } else {
        imagen.removeAttribute("src");
        imagen.alt = "";
        imagen.classList.add("oculto");
    }

    modal.classList.remove("oculto");
    document.body.style.overflow = "hidden";
    cerrarModal.focus();
}

function cerrarFicha() {
    modal.classList.add("oculto");
    document.body.style.overflow = "";
}

busqueda.addEventListener("input", aplicarFiltros);
filtroDirector.addEventListener("change", aplicarFiltros);

document.getElementById("limpiarFiltros").addEventListener("click", () => {
    busqueda.value = "";
    filtroDirector.value = "";
    aplicarFiltros();
});

cerrarModal.addEventListener("click", cerrarFicha);

modal.addEventListener("click", evento => {
    if (evento.target === modal) {
        cerrarFicha();
    }
});

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !modal.classList.contains("oculto")) {
        cerrarFicha();
    }
});

cargarPeliculas();
