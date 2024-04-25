const express = require("express");
const cors = require("cors");
const translate = require("node-google-translate-skidz");
const fs = require("fs").promises;
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/productos", async (req, res) => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const productos = await response.json();
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).send('Error al obtener los productos.');
  }
});
app.get("/ofertas", async (req, res) => {
  try {
    const response = await fs.readFile("ofertas.json");
    const ofertas = JSON.parse(response);
    res.json(ofertas);
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    res.status(500).send('Error al obtener las ofertas.');
  }
});
async function traducir(texto) {
  const resultado = await translate({
    text: texto,
    source: "en",
    target: "es",
  });
  return resultado.translation;
}
app.post("/traducir", async (req, res) => {
  try {
    const texto = req.body.texto;
    const traduccion = await traducir(texto);
    res.json({ traduccion: traduccion });
  } catch (error) {
    console.error("Error al obtener la traduccion:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post('/compras', async (req, res) => {
  try {
    const nuevacompra = req.body;
    let compras = [];
    try {
      const comprasanteriores = await fs.readFile('compras.json', 'utf8');
      compras = JSON.parse(comprasanteriores);
    } catch (error) {
      console.error('Error al leer el archivo "compras.json":', error);
    }
    compras.push(nuevacompra);
    await fs.writeFile('compras.json', JSON.stringify(compras, null, 2));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
