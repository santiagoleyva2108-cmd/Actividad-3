// 1. Seleccionar elementos del index

const formulario = document.getElementById('formulario-usuario'); // Ojo: corregido al form, no a la sección
const campoId = document.getElementById('id');
const campoNombre = document.getElementById('nombre');
const campoCorreo = document.getElementById('correo');
const campoCiudad = document.getElementById('ciudad');
const buscador = document.getElementById('buscador');
const tablaUsuarios = document.getElementById('tabla-usuarios');
const mensaje = document.getElementById('mensaje');
const botonGuardar = document.getElementById('btn-guardar');

// Dirección de la API
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// Arreglo que almacenará los usuarios
let usuarios = [];

// Guarda el ID del usuario que se está editando (null si estamos creando uno nuevo)
let idEnEdicion = null;


// 2. Mostrar mensaje de estado

const mostrarMensaje = (texto) => {
    mensaje.textContent = texto;
};


// 3. Cargar usuarios desde la API

const cargarUsuarios = async () => {
    mostrarMensaje("Cargando usuarios...");

    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los usuarios.");
        }

        const datos = await respuesta.json();

        // Transformar los datos usando map()
        usuarios = datos.map((usuario) => {
            const { id, name, email, address } = usuario;

            return {
                id: Number(id),
                nombre: name,
                correo: email,
                ciudad: address.city
            };
        });

        imprimirUsuarios();
        dibujarTabla(usuarios);
        contarUsuariosPorCiudad();

        mostrarMensaje(`Se cargaron ${usuarios.length} usuarios correctamente.`);

    } catch (error) {
        console.error("Error al cargar los usuarios:", error);
        mostrarMensaje("No fue posible cargar los usuarios. Verifica tu conexión e inténtalo nuevamente.");
    }
};


// 4. Imprimir el arreglo completo en consola

const imprimirUsuarios = () => {
    console.log("Usuarios cargados:");
    console.log(JSON.stringify(usuarios, null, 2));
};


// 5. Contar usuarios por ciudad mediante bucle (For...of)

const contarUsuariosPorCiudad = () => {
    const cantidades = {};

    for (const usuario of usuarios) {
        const ciudad = usuario.ciudad;
        
        if (cantidades[ciudad]) {
            cantidades[ciudad]++;
        } else {
            cantidades[ciudad] = 1;
        }
    }

    console.log("Cantidad de usuarios por ciudad:", cantidades);
};


// 6. Dibujar la tabla dinámicamente (Usando Template Strings y DOM)

const dibujarTabla = (listaUsuarios) => {
    tablaUsuarios.innerHTML = ""; // Limpiar tabla antes de redibujar

    if (listaUsuarios.length === 0) {
        tablaUsuarios.innerHTML = `<tr><td colspan="5" style="text-align: center;">No se encontraron usuarios.</td></tr>`;
        return;
    }

    for (const usuario of listaUsuarios) {
        // Desestructuración de cada usuario
        const { id, nombre, correo, ciudad } = usuario;

        const fila = document.createElement('tr');

        // Uso de Template Strings para armar el HTML de cada fila
        fila.innerHTML = `
            <td>${id}</td>
            <td>${nombre}</td>
            <td>${correo}</td>
            <td>${ciudad}</td>
            <td>
                <button class="btn-editar" data-id="${id}">Editar</button>
                <button class="btn-eliminar" data-id="${id}">Eliminar</button>
            </td>
        `;

        tablaUsuarios.appendChild(fila);
    }
};


// 7. Gestion de formulario (Agregar y Modificar)

formulario.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const idIngresado = Number(campoId.value.trim());
    const nombreIngresado = campoNombre.value.trim();
    const correoIngresado = campoCorreo.value.trim();
    const ciudadIngresada = campoCiudad.value.trim();

    // Validar que el correo contenga '@'
    if (!correoIngresado.includes('@')) {
        mostrarMensaje("Error: El correo electrónico debe contener '@'.");
        return;
    }

    // Si se esta editando un usuario existente
    if (idEnEdicion !== null) {
        usuarios = usuarios.map((usuario) => {
            if (usuario.id === idEnEdicion) {
                return {
                    ...usuario,
                    nombre: nombreIngresado,
                    correo: correoIngresado,
                    ciudad: ciudadIngresada
                };
            }
            return usuario;
        });

        mostrarMensaje(`¡Usuario con ID ${idEnEdicion} modificado exitosamente!`);
        
        // Resetear modo edición
        idEnEdicion = null;
        campoId.removeAttribute('disabled'); // Volver a habilitar el ID
        botonGuardar.textContent = "Agregar usuario";

    } else {

        // Si se esta agregando un nuevo usuario
        // Validar que el ID no exista previamente en el arreglo
        const idExiste = usuarios.some((usuario) => usuario.id === idIngresado);

        if (idExiste) {
            mostrarMensaje(`Ya existe un usuario con el ID ${idIngresado}. Por favor, usa otro.`);
            return;
        }

        const nuevoUsuario = {
            id: idIngresado,
            nombre: nombreIngresado,
            correo: correoIngresado,
            ciudad: ciudadIngresada
        };

        // Agregar al inicio o al final del array
        usuarios.push(nuevoUsuario);
        mostrarMensaje(`¡Usuario "${nombreIngresado}" registrado con éxito!`);
    }

    imprimirUsuarios();
    dibujarTabla(usuarios);
    contarUsuariosPorCiudad();
    formulario.reset(); // Limpiar el formulario
});


// 8. Busqueda en vivo (Usando el método filter)

buscador.addEventListener('input', (e) => {
    const textoBusqueda = e.target.value.toLowerCase().trim();

    // Filtrar usuarios cuyo nombre coincida sin alterar el array original
    const usuariosFiltrados = usuarios.filter((usuario) => 
        usuario.nombre.toLowerCase().includes(textoBusqueda)
    );

    dibujarTabla(usuariosFiltrados);
});


// 9. Acciones de la tabla: Editar y Eliminar (Delegación de eventos en el <tbody>)

tablaUsuarios.addEventListener('click', (e) => {
    const boton = e.target;
    const idUsuario = Number(boton.getAttribute('data-id'));

    // ACCIÓN: ELIMINAR
    if (boton.classList.contains('btn-eliminar')) {
        const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al usuario con ID ${idUsuario}?`);
        
        if (confirmar) {
            // Filtrar el arreglo excluyendo el ID seleccionado
            usuarios = usuarios.filter((usuario) => usuario.id !== idUsuario);

            imprimirUsuarios();
            dibujarTabla(usuarios);
            contarUsuariosPorCiudad();
            mostrarMensaje(`Usuario con ID ${idUsuario} eliminado correctamente.`);
        }
    }

    // ACCIÓN: EDITAR
    if (boton.classList.contains('btn-editar')) {
        const usuarioAEditar = usuarios.find((usuario) => usuario.id === idUsuario);

        if (usuarioAEditar) {

            // Cargar los datos en el formulario
            campoId.value = usuarioAEditar.id;
            campoId.setAttribute('disabled', 'true'); // Bloquear el ID para que no se cambie
            campoNombre.value = usuarioAEditar.nombre;
            campoCorreo.value = usuarioAEditar.correo;
            campoCiudad.value = usuarioAEditar.ciudad;

            idEnEdicion = usuarioAEditar.id;
            botonGuardar.textContent = "Guardar cambios";
            mostrarMensaje(`Editando al usuario: ${usuarioAEditar.nombre}. Modifica los campos y haz clic en Guardar cambios.`);
            
            // Subir la vista suavemente hacia el formulario
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});


// 10. Iniciar la pagina al cargar
cargarUsuarios();