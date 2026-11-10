const express = require("express");
const router = express.Router();

const { nekretnine } = require("../data/podaci");

// Dohvati sve nekretnine
router.get("/", (req, res) => {
  res.status(200).json(nekretnine);
});

// Dohvati nekretninu po ID-u
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  // Provjera ispravnosti ID-a
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID nekretnine mora biti pozitivan cijeli broj",
    });
  }

  // Pronalazak nekretnine
  const nekretnina = nekretnine.find((n) => n.id === id);

  if (!nekretnina) {
    return res.status(404).json({
      poruka: "Nekretnina s navedenim ID-om ne postoji",
    });
  }

  res.status(200).json(nekretnina);
});

// Dodaj novu nekretninu
router.post("/", (req, res) => {
  const { id, naziv, opis, cijena, lokacija, brojSoba, povrsina } =
    req.body || {};

  // Provjera obaveznih podataka
  if (
    [id, naziv, opis, cijena, lokacija, brojSoba, povrsina].some(
      (podatak) => podatak === undefined || podatak === null,
    )
  ) {
    return res.status(400).json({
      poruka: "Potrebno je poslati sve podatke o nekretnini",
    });
  }

  // Provjera ID-a
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID mora biti pozitivan cijeli broj",
    });
  }

  // Provjera postoji li ID
  if (nekretnine.some((n) => n.id === id)) {
    return res.status(409).json({
      poruka: "Nekretnina s navedenim ID-om već postoji",
    });
  }

  // Provjera tekstualnih podataka
  if (
    [naziv, opis, lokacija].some(
      (podatak) => typeof podatak !== "string" || podatak.trim() === "",
    )
  ) {
    return res.status(400).json({
      poruka: "Naziv, opis i lokacija moraju biti neprazni tekstovi",
    });
  }

  // Provjera numeričkih podataka
  if (
    typeof cijena !== "number" ||
    !Number.isFinite(cijena) ||
    cijena < 0 ||
    !Number.isInteger(brojSoba) ||
    brojSoba < 0 ||
    typeof povrsina !== "number" ||
    !Number.isFinite(povrsina) ||
    povrsina <= 0
  ) {
    return res.status(400).json({
      poruka:
        "Cijena i broj soba ne smiju biti negativni, a površina mora biti pozitivna",
    });
  }

  const novaNekretnina = {
    id,
    naziv,
    opis,
    cijena,
    lokacija,
    brojSoba,
    povrsina,
  };

  nekretnine.push(novaNekretnina);

  res.status(201).json({
    poruka: "Nekretnina uspješno dodana",
    nekretnina: novaNekretnina,
  });
});

// Potpuno ažuriranje nekretnine
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID mora biti pozitivan cijeli broj",
    });
  }

  const nekretnina = nekretnine.find((n) => n.id === id);

  if (!nekretnina) {
    return res.status(404).json({
      poruka: "Nekretnina s navedenim ID-om ne postoji",
    });
  }

  const { naziv, opis, cijena, lokacija, brojSoba, povrsina } = req.body || {};

  // Provjera svih obaveznih podataka
  if (
    [naziv, opis, cijena, lokacija, brojSoba, povrsina].some(
      (podatak) => podatak === undefined || podatak === null,
    )
  ) {
    return res.status(400).json({
      poruka: "Potrebno je poslati sve podatke o nekretnini",
    });
  }

  // Provjera tekstualnih podataka
  if (
    [naziv, opis, lokacija].some(
      (podatak) => typeof podatak !== "string" || podatak.trim() === "",
    )
  ) {
    return res.status(400).json({
      poruka: "Naziv, opis i lokacija moraju biti neprazni tekstovi",
    });
  }

  // Provjera numeričkih podataka
  if (
    typeof cijena !== "number" ||
    !Number.isFinite(cijena) ||
    cijena < 0 ||
    !Number.isInteger(brojSoba) ||
    brojSoba < 0 ||
    typeof povrsina !== "number" ||
    !Number.isFinite(povrsina) ||
    povrsina <= 0
  ) {
    return res.status(400).json({
      poruka:
        "Cijena i broj soba ne smiju biti negativni, a površina mora biti pozitivna",
    });
  }

  // Zamjena svih podataka nekretnine
  Object.assign(nekretnina, {
    naziv,
    opis,
    cijena,
    lokacija,
    brojSoba,
    povrsina,
  });

  res.status(200).json({
    poruka: "Nekretnina uspješno ažurirana",
    nekretnina: nekretnina,
  });
});

// Djelomično ažuriranje nekretnine
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID mora biti pozitivan cijeli broj",
    });
  }

  const nekretnina = nekretnine.find((n) => n.id === id);

  if (!nekretnina) {
    return res.status(404).json({
      poruka: "Nekretnina s navedenim ID-om ne postoji",
    });
  }

  const promjene = req.body;

  if (
    !promjene ||
    typeof promjene !== "object" ||
    Array.isArray(promjene) ||
    Object.keys(promjene).length === 0
  ) {
    return res.status(400).json({
      poruka: "Potrebno je poslati podatke za ažuriranje",
    });
  }

  const dozvoljenaPolja = [
    "naziv",
    "opis",
    "cijena",
    "lokacija",
    "brojSoba",
    "povrsina",
  ];

  for (const [kljuc, vrijednost] of Object.entries(promjene)) {
    if (!dozvoljenaPolja.includes(kljuc)) {
      return res.status(400).json({
        poruka: `Polje ${kljuc} nije dozvoljeno`,
      });
    }

    if (["naziv", "opis", "lokacija"].includes(kljuc)) {
      if (typeof vrijednost !== "string" || vrijednost.trim() === "") {
        return res.status(400).json({
          poruka: `Polje ${kljuc} mora biti neprazan tekst`,
        });
      }
    }

    if (
      kljuc === "cijena" &&
      (typeof vrijednost !== "number" ||
        !Number.isFinite(vrijednost) ||
        vrijednost < 0)
    ) {
      return res.status(400).json({
        poruka: "Cijena ne smije biti negativna",
      });
    }

    if (
      kljuc === "brojSoba" &&
      (!Number.isInteger(vrijednost) || vrijednost < 0)
    ) {
      return res.status(400).json({
        poruka: "Broj soba mora biti nenegativan cijeli broj",
      });
    }

    if (
      kljuc === "povrsina" &&
      (typeof vrijednost !== "number" ||
        !Number.isFinite(vrijednost) ||
        vrijednost <= 0)
    ) {
      return res.status(400).json({
        poruka: "Površina mora biti pozitivan broj",
      });
    }
  }

  Object.assign(nekretnina, promjene);

  res.status(200).json({
    poruka: "Nekretnina uspješno djelomično ažurirana",
    nekretnina: nekretnina,
  });
});

// Brisanje nekretnine
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  // Provjera ID-a
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID mora biti pozitivan cijeli broj",
    });
  }

  // Pronalazak indeksa nekretnine
  const index = nekretnine.findIndex((n) => n.id === id);

  if (index === -1) {
    return res.status(404).json({
      poruka: "Nekretnina s navedenim ID-om ne postoji",
    });
  }

  // Brisanje iz polja
  const obrisanaNekretnina = nekretnine.splice(index, 1)[0];

  res.status(200).json({
    poruka: "Nekretnina uspješno obrisana",
    nekretnina: obrisanaNekretnina,
  });
});

module.exports = router;
