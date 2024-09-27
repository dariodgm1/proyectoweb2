const URL_DEPARTAMENTOS = 'https://collectionapi.metmuseum.org/public/collection/v1/departments';
const URL_OBJETOS = `https://collectionapi.metmuseum.org/public/collection/v1/objects`;
const URL_OBJETO = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;
const URL_SEARCH_HAS_IMAGE = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true`;
const URL_SEARCH = `https://collectionapi.metmuseum.org/public/collection/v1/search`;
//https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=Auguste Renoir

let currentPage = 1;
const itemsPerPage = 20;
let totalItems = 0;

//funcion para objetos
async function fetchObjetos(objectIDs) {
    totalItems= objectIDs.length;
    let objetosHtml = '';
    let paginatedIDs = objectIDs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    switch (currentPage) {
        case 1: 
            document.getElementById("numeropagina").innerText= "1";
            break;
        case 2: 
            document.getElementById("numeropagina").innerText= "2";
            break;
        case 3: 
            document.getElementById("numeropagina").innerText= "3";
            break;
        case 4: 
            document.getElementById("numeropagina").innerText= "4";
            break;
        case 5: 
            document.getElementById("numeropagina").innerText= "5";
            break;
    }
    
    //console.log(objectIDs);
    
    for (const objectID of paginatedIDs) {
        const response = await fetch(URL_OBJETO + objectID);
        const data = await response.json();
        if(!response.ok) continue;
      //        console.log(data.title, data.dynasty, data.culture, data.objectDate, data.objectID);
        let localRes = await fetch('/traduccion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
    
            body: JSON.stringify([{
                titulo: data.title.trim() !== "" ? data.title : 'A stranger',
                cultura: data.culture.trim() !== "" ? data.culture : 'Not registered',
                dinastia: data.dynasty.trim() !== "" ? data.dynasty : 'Unknown',
                fecha: data.objectDate.trim() !== "" ? data.objectDate : 'A stranger',}])
            });
            
           // if (!localRes.ok) throw { status: localRes.status, statusText: localRes.statusText };
            
            let objetosTraducidos = await localRes.json();
            console.log(`objeto traducido:`, objetosTraducidos[0].titulo );
            objetosHtml += `
            <div class="col">
                <div class="card">
                    <img src="${data.primaryImageSmall != "" ? data.primaryImageSmall : "sin_imagen.jpg"}" class="card-img-top" title="Fecha: ${objetosTraducidos[0].fecha}">
                    <div class="card-body">
                        <h5 class="card-title">${objetosTraducidos[0].titulo}</h5>
                        <p class="card-text">cultura: ${objetosTraducidos[0].cultura}</p>
                        <p class="card-text">dinastía: ${objetosTraducidos[0].dinastia}</p>
                 ${data.additionalImages && data.additionalImages.length > 0 ? `<button data-bs-toggle="modal" data-bs-target="#imagenesModal" type="button" onclick="cargarMasImagenes(${objectID}, '${objetosTraducidos[0].titulo}')">Más Imágenes</button>` : ''}
                    </div>
                </div>
            </div>`;

    }


    document.getElementById("grilla").innerHTML = objetosHtml;
}


fetch(URL_SEARCH_HAS_IMAGE)
    .then((response) => response.json())
    .then((data) => {
        fetchObjetos(data.objectIDs.slice(0, 100)); //trae 20 objetos
    })

// Función para cargar los departamentos
function cargarDepartamentos() {
    fetch(URL_DEPARTAMENTOS)
    .then(response => response.json())
    .then(data => {
            const departmentSelect = document.getElementById('department');
            data.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.departmentId;
                option.textContent = dept.displayName;
                departmentSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar los departamentos:', error));
}

// Controles de paginación
function nextPage() {
    if (currentPage * itemsPerPage < totalItems) {
        currentPage++;
        fetch(URL_SEARCH_HAS_IMAGE)
    .then((response) => response.json())
    .then((data) => {
        fetchObjetos(data.objectIDs.slice(0, 100)); 
    })
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        fetch(URL_SEARCH_HAS_IMAGE)
    .then((response) => response.json())
    .then((data) => {
        fetchObjetos(data.objectIDs.slice(0, 100)); //trae 20 objetos
    }); // Carga la página anterior
    }
}

async function cargarMasImagenes(objectID, tituloTraducido) {
    try {

        let resObjeto = await fetch(URL_OBJETO + objectID);
        if (!resObjeto.ok) throw new Error(`al obtener el objeto: ${resObjeto.status} - ${resObjeto.statusText}`);

        let data = await resObjeto.json();
        let imagenesAdicionales = data.additionalImages;

        if (!imagenesAdicionales || imagenesAdicionales.length === 0) {
            throw new Error('Error No se encontraron imágenes adicionales.');
        }
        function cambiarTamañoImagen(url) { //funcion para cambiar la URL de las imagen para que me traiga las mas chicas y no las orginales
            console.log(url);
            let nuevaUrl = url.replace('/original/', '/web-large/');
            console.log(nuevaUrl);
            return nuevaUrl;
        }

        let imagenesHTML = imagenesAdicionales.map(img => `
            <div class="col-4">
                <img src="${cambiarTamañoImagen(img)}" class="img-fluid" alt="Imagen adicional">
            </div>
        `).join('');
         console.log(imagenesHTML);
      
        document.getElementById("tituloModal").innerHTML = data.title.trim() !== "" ? tituloTraducido : `<span style="color: red;">${tituloTraducido}</span>`;
        document.getElementById("cargarImagenes").innerHTML = imagenesHTML;
    } catch (err) {
        console.error(`Error al cargar imágenes adicionales para el ID ${objectID}: ${err.message}`);
    }
}

document.getElementById("buscar").addEventListener("click", (event) => {
    event.preventDefault();
    const departamento = document.getElementById("department").value;
    const keyword = document.getElementById("keyword").value;
    const localizacion = document.getElementById("localizacion").value;
    const paramLocalizacion = localizacion != '' ? `&geolocalization=${localizacion}` : "";
      console.log(departamento, localizacion);
      console.log(URL_SEARCH + `?q=${keyword}&departmentId=${departamento}${paramLocalizacion}`);
    fetch(URL_SEARCH + `?q=${keyword}&departmentId=${departamento}${paramLocalizacion}`)
        .then(response => response.json())
        .then((data) => {
            fetchObjetos(data.objectIDs.slice(0, 100));

        });
});

// Cargar departamentos al cargar la página
document.addEventListener('DOMContentLoaded', cargarDepartamentos);
