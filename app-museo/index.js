const express = require("express");
const app = express();
const translate = require("node-google-translate-skidz");
const port = 8100;
const cors = require("cors");
// Manejar errores del servidor
//app.on('error', onError);
//app.on('listening', onListening);


app.use(express.static("public"));
app.use(express.json());
app.use(cors());


//traducir

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
app.listen(port, () => {
    console.log(`Servidor iniciado en puerto ${port}`);
});