const URL_DEPARTAMENTOS = 'https://collectionapi.metmuseum.org/public/collection/v1/departments';
const URL_OBJETOS = `https://collectionapi.metmuseum.org/public/collection/v1/objects`;
const URL_OBJETO = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;
const URL_SEARCH_HAS_IMAGE = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true`;
const URL_SEARCH = `https://collectionapi.metmuseum.org/public/collection/v1/search`;
//https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=Auguste Renoir


//funcion para objetos
async function fetchObjetos(objectIDs) {
    let objetosHtml = '';
    

    for (const objectID of objectIDs) {
        const response = await fetch(URL_OBJETO + objectID);
        const data = await response.json();

        let localRes = await fetch('http://localhost:8080/traduccion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
    
            body: JSON.stringify([{
                titulo: jsonObjeto.title.trim() !== "" ? jsonObjeto.title : 'A stranger',
                cultura: jsonObjeto.culture.trim() !== "" ? jsonObjeto.culture : 'Not registered',
                dinastia: jsonObjeto.dynasty.trim() !== "" ? jsonObjeto.dynasty : 'Unknown',
                fecha: jsonObjeto.objectDate.trim() !== "" ? jsonObjeto.objectDate : `A stranger`}])
            });
            
            if (!resLocal.ok) throw { status: resLocal.status, statusText: resLocal.statusText };
            
            let objetosTraducidos = await localRes.json();
            console.log(`objeto traducido:`, objetosTraducidos[0].titulo );
            objetosHtml += `
            <div class="col">
                <div class="card">
                    <img src="${data.primaryImageSmall != "" ? data.primaryImageSmall : "sin_imagen.jpg"}" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${objetosTraducidos[0].titulo}</h5>
                        <p class="card-text">cultura: ${objetosTraducidos[0].cultura}</p>
                        <p class="card-text">dinastía: ${objetosTraducidos[0].dinastia}</p>
                    </div>
                </div>
            </div>`;

    }


    document.getElementById("grilla").innerHTML = objetosHtml;
}


fetch(URL_SEARCH_HAS_IMAGE)
    .then((response) => response.json())
    .then((data) => {
        fetchObjetos(data.objectIDs.slice(0, 20)); //trae 20 objetos

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
            fetchObjetos(data.objectIDs.slice(0, 20));

        });
});

// Cargar departamentos al cargar la página
document.addEventListener('DOMContentLoaded', cargarDepartamentos);