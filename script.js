// ===== Referencias a elementos (se buscan UNA sola vez desde document) =====
const app = document.getElementById("app");
const formulario = document.getElementById("form-plato");
const listaPlatos = document.getElementById("lista-platos");
const avisoVacio = document.getElementById("vacio-platos");
const listaPedido = document.getElementById("lista-pedido");
const avisoPedidoVacio = document.getElementById("vacio-pedido");
const spanTotal = document.getElementById("total");

// ===== CREATE: construye una fila de plato =====
function crearFila(nombre, precio) {
  const fila = document.createElement("li");
  fila.className = "plato";

  const spanNombre = document.createElement("span");
  spanNombre.className = "nombre";
  spanNombre.textContent = nombre; // textContent: el texto del usuario nunca se interpreta como HTML

  const spanPrecio = document.createElement("span");
  spanPrecio.className = "precio";
  spanPrecio.textContent = precio;

  // Contenedor de los tres botones (hermanos entre sí)
  const acciones = document.createElement("div");
  acciones.className = "acciones";

  const botones = [
    ["btn-pedir", "Pedir"],
    ["btn-editar", "Editar"],
    ["btn-eliminar", "Eliminar"],
  ];
  for (const [clase, texto] of botones) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = clase;
    boton.textContent = texto;
    acciones.appendChild(boton);
  }

  // Armamos el árbol: li > (nombre, precio, acciones > botones)
  fila.append(spanNombre, spanPrecio, acciones);
  return fila;
}

// ===== READ: muestra u oculta el aviso de "lista vacía" =====
function actualizarVacio() {
  // children.length cuenta los hijos-elemento de la lista (no necesitamos un contador aparte)
  avisoVacio.hidden = listaPlatos.children.length > 0;
}

// ===== Agregar un plato desde el formulario =====
function agregarPlato() {
  const nombre = formulario.elements["nombre"].value.trim();
  const precio = formulario.elements["precio"].value.trim();

  // Se ignora el texto vacío o un precio inválido
  if (nombre === "" || precio === "" || Number(precio) < 0) {
    return;
  }

  listaPlatos.appendChild(crearFila(nombre, precio));
  formulario.reset();
  formulario.elements["nombre"].focus();
  actualizarVacio();
}

// ===== DELETE: borra solo la fila del botón que se tocó =====
function eliminarPlato(boton) {
  // Subimos desde el botón hasta SU fila. Sin ids, sin buscar en document
  const fila = boton.closest(".plato");
  fila.remove();
  actualizarVacio();
}

// ===== UPDATE: alterna entre ver el plato y editarlo =====
function editarPlato(boton) {
  const fila = boton.closest(".plato");

  if (fila.classList.contains("editando")) {
    guardarEdicion(fila, boton);
    return;
  }

  // Bajamos desde la fila hasta sus datos actuales
  const spanNombre = fila.querySelector(".nombre");
  const spanPrecio = fila.querySelector(".precio");

  // Cambiamos cada texto por un campo con el valor actual
  const campoNombre = document.createElement("input");
  campoNombre.type = "text";
  campoNombre.className = "editar-nombre";
  campoNombre.value = spanNombre.textContent;

  const campoPrecio = document.createElement("input");
  campoPrecio.type = "number";
  campoPrecio.className = "editar-precio";
  campoPrecio.min = "0";
  campoPrecio.value = spanPrecio.textContent;

  spanNombre.replaceWith(campoNombre); // replaceWith pone el campo en el mismo lugar del árbol
  spanPrecio.replaceWith(campoPrecio);

  fila.classList.add("editando");
  boton.textContent = "Guardar";
  campoNombre.focus();
}

function guardarEdicion(fila, boton) {
  const campoNombre = fila.querySelector(".editar-nombre");
  const campoPrecio = fila.querySelector(".editar-precio");

  const nombre = campoNombre.value.trim();
  const precio = campoPrecio.value.trim();

  // Si falta algo, no guardamos y la fila sigue en modo edición
  if (nombre === "" || precio === "" || Number(precio) < 0) {
    campoNombre.focus();
    return;
  }

  // Volvemos a crear los spans con el texto nuevo (textContent, nunca innerHTML)
  const spanNombre = document.createElement("span");
  spanNombre.className = "nombre";
  spanNombre.textContent = nombre;

  const spanPrecio = document.createElement("span");
  spanPrecio.className = "precio";
  spanPrecio.textContent = precio;

  campoNombre.replaceWith(spanNombre);
  campoPrecio.replaceWith(spanPrecio);

  fila.classList.remove("editando");
  boton.textContent = "Editar";
}

// ===== ACCIÓN PROPIA: Pedir suma el plato a la lista de pedido =====
function pedirPlato(boton) {
  // Subimos del botón Pedir a SU fila de plato
  const fila = boton.closest(".plato");

  // Si la fila se está editando, sus datos son campos y no texto: no se puede pedir
  if (fila.classList.contains("editando")) {
    return;
  }

  // Bajamos de la fila a su nombre y su precio
  const nombre = fila.querySelector(".nombre").textContent;
  const precio = fila.querySelector(".precio").textContent;

  // Creamos la línea del pedido
  const item = document.createElement("li");
  item.className = "item-pedido";

  const spanNombre = document.createElement("span");
  spanNombre.className = "nombre";
  spanNombre.textContent = nombre;

  const spanPrecio = document.createElement("span");
  spanPrecio.className = "precio";
  spanPrecio.textContent = precio;

  const botonQuitar = document.createElement("button");
  botonQuitar.type = "button";
  botonQuitar.className = "btn-quitar";
  botonQuitar.textContent = "Quitar";

  item.append(spanNombre, spanPrecio, botonQuitar);
  listaPedido.appendChild(item);
  actualizarPedido();
}

// ===== Quitar una línea del pedido =====
function quitarDelPedido(boton) {
  boton.closest(".item-pedido").remove(); // sube a SU línea y la borra
  actualizarPedido();
}

// ===== Recalcula el total y el aviso del pedido =====
function actualizarPedido() {
  let total = 0;

  // listaPedido.children son las líneas del pedido; de cada una bajamos a su precio
  for (const item of listaPedido.children) {
    total += Number(item.querySelector(".precio").textContent);
  }

  spanTotal.textContent = total;
  avisoPedidoVacio.hidden = listaPedido.children.length > 0;
}

// ===== DELEGACIÓN DE EVENTOS: el ÚNICO addEventListener del proyecto =====
app.addEventListener("click", function (evento) {
  // evento.target es lo que se tocó; closest("button") sube hasta el botón (por si se toca algo dentro de él)
  const boton = evento.target.closest("button");
  if (boton === null) {
    return; // se hizo clic en otra cosa, no hacemos nada
  }

  // Botón del formulario. Enter dentro de un campo también dispara este clic
  if (boton.closest("#form-plato") !== null) {
    evento.preventDefault(); // evita que la página se recargue
    agregarPlato();
    return;
  }

  // Según la clase del botón, decidimos qué hacer
  if (boton.classList.contains("btn-eliminar")) {
    eliminarPlato(boton);
  } else if (boton.classList.contains("btn-editar")) {
    editarPlato(boton);
  } else if (boton.classList.contains("btn-pedir")) {
    pedirPlato(boton);
  } else if (boton.classList.contains("btn-quitar")) {
    quitarDelPedido(boton);
  }
});

// ===== Inicio: platos de ejemplo y estado de lista vacía =====
listaPlatos.appendChild(crearFila("Bandeja paisa", "28000"));
listaPlatos.appendChild(crearFila("Sancocho de gallina", "22000"));
actualizarVacio();