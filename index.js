const express = require("express");
const app = express();

const nekretnineRouter = require("./routes/nekretnine");

const ponudeRouter = require("./routes/ponude");

const PORT = 3000;

app.use(express.json());

app.use("/ponude", ponudeRouter);

// Početna ruta
app.get("/", (req, res) => {
  res.send("API za agenciju za nekretnine");
});

// Rute za nekretnine
app.use("/nekretnine", nekretnineRouter);

// Pokretanje poslužitelja
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
