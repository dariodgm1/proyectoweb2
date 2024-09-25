const express = require("express");
const app = express();
const  translate  = requiere("node-google-translate-skidz");
const translate = require('node-google-translate-skidz');

const port = 8080;




app.use(express.static("public"));

//traducir texto completo de un objeto. o dijo el profe que tambien se puede mandar todo el objeto
//otra forma que el buscar hago un post a un punto y q hece endpoint te devuelva todo el html completo.
// la paginacion: voy a tener una variable page(para pasarle el numero de pagina asi le paso el enlace) o pug .
app.post('/traduccion', async (req, res) => {

    let objetosTraducidos = req.body;

    console.log(objetosTraducidos);
    try {
        const traducciones = await Promise.all(objetosTraducidos.map(async (item) => {

            const [tituloTraducido, culturaTraducida, dinastiaTraducida, fechaTraducida] = await Promise.all([
                translate({ text: item.titulo, source: 'en', target: 'es' }),
                translate({ text: item.cultura, source: 'en', target: 'es' }),
                translate({ text: item.dinastia, source: 'en', target: 'es' }),
                translate({ text: item.fecha, source: 'en', target: 'es' })
            ]);

            return {
                titulo: tituloTraducido.translation,
                cultura: culturaTraducida.translation,
                dinastia: dinastiaTraducida.translation,
                fecha: fechaTraducida.translation
            };
        }));
        console.log(traducciones);
        res.json(traducciones);
    } catch (err) {
        console.error('Error al traducir los datos:', err);
        res.status(500).send('Error al traducir los datos');
    }
});

 
 
//asi solo se envia una sola palabra para manejar mas hay q crear un json.
/*app.get("/traducir/:texto", (req, res) => {
    translate({
        text: req.params.texto,
        source: 'en',
        target: 'es'

    }, function(result){
           res.json({ textotraducido: result.translation });    
});
});*/

app.listen(port, () => {
    console.log(`Servidor iniciado en puerto ${port}`);
});