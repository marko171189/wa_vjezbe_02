const express = require("express");
const router = express.Router();

const { ponude, nekretnine } = require("../data/podaci");

// Dohvati sve ponude
router.get("/", (req, res) => {
  res.status(200).json(ponude);
});

// Dohvati ponudu prema ID-u
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID ponude mora biti pozitivan cijeli broj",
    });
  }

  const ponuda = ponude.find((p) => p.id === id);

  if (!ponuda) {
    return res.status(404).json({
      poruka: "Ponuda s navedenim ID-om ne postoji",
    });
  }

  res.status(200).json(ponuda);
});

// Dodavanje nove ponude

router.post("/", (req, res) => {
  const { id, nekretninaId, ime, prezime, cijena, brojTelefona } =
    req.body || {};

  if (
    id === undefined ||
    nekretninaId === undefined ||
    ime === undefined ||
    prezime === undefined ||
    cijena === undefined ||
    brojTelefona === undefined
  ) {
    return res.status(400).json({
      poruka: "Potrebno je poslati sve podatke o ponudi",
    });
  }

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(nekretninaId) ||
    nekretninaId <= 0 ||
    typeof ime !== "string" ||
    !ime.trim() ||
    typeof prezime !== "string" ||
    !prezime.trim() ||
    typeof cijena !== "number" ||
    !Number.isFinite(cijena) ||
    cijena <= 0 ||
    typeof brojTelefona !== "string" ||
    !brojTelefona.trim()
  ) {
    return res.status(400).json({
      poruka: "Neispravni podaci o ponudi",
    });
  }

  if (!nekretnine.some((n) => n.id === nekretninaId)) {
    return res.status(404).json({
      poruka: "Nekretnina s navedenim ID-om ne postoji",
    });
  }

  if (ponude.some((p) => p.id === id)) {
    return res.status(409).json({
      poruka: "Ponuda s navedenim ID-om već postoji",
    });
  }

  const novaPonuda = {
    id,
    nekretninaId,
    ime: ime.trim(),
    prezime: prezime.trim(),
    cijena,
    brojTelefona: brojTelefona.trim(),
  };

  ponude.push(novaPonuda);

  res.status(201).json({
    poruka: "Ponuda uspješno dodana",
    ponuda: novaPonuda,
  });
});

// Ažuriranje postojeće ponude

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID ponude mora biti pozitivan cijeli broj",
    });
  }

  const ponuda = ponude.find((p) => p.id === id);

  if (!ponuda) {
    return res.status(404).json({
      poruka: "Ponuda s navedenim ID-om ne postoji",
    });
  }

  const { nekretninaId, ime, prezime, cijena, brojTelefona } = req.body || {};

  if (
    nekretninaId === undefined ||
    ime === undefined ||
    prezime === undefined ||
    cijena === undefined ||
    brojTelefona === undefined
  ) {
    return res.status(400).json({
      poruka: "Potrebno je poslati sve podatke o ponudi",
    });
  }

  if (
    !Number.isInteger(nekretninaId) ||
    nekretninaId <= 0 ||
    typeof ime !== "string" ||
    !ime.trim() ||
    typeof prezime !== "string" ||
    !prezime.trim() ||
    typeof cijena !== "number" ||
    !Number.isFinite(cijena) ||
    cijena <= 0 ||
    typeof brojTelefona !== "string" ||
    !brojTelefona.trim()
  ) {
    return res.status(400).json({
      poruka: "Neispravni podaci o ponudi",
    });
  }

  if (!nekretnine.some((n) => n.id === nekretninaId)) {
    return res.status(404).json({
      poruka: "Nekretnina s navedenim ID-om ne postoji",
    });
  }

  ponuda.nekretninaId = nekretninaId;
  ponuda.ime = ime.trim();
  ponuda.prezime = prezime.trim();
  ponuda.cijena = cijena;
  ponuda.brojTelefona = brojTelefona.trim();

  res.status(200).json({
    poruka: "Ponuda uspješno ažurirana",
    ponuda: ponuda,
  });
});

// Djelomično ažuriranje ponude

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID mora biti pozitivan cijeli broj",
    });
  }

  const ponuda = ponude.find((p) => p.id === id);

  if (!ponuda) {
    return res.status(404).json({
      poruka: "Ponuda s navedenim ID-om ne postoji",
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

  const dopustenaPolja = [
    "nekretninaId",
    "ime",
    "prezime",
    "cijena",
    "brojTelefona",
  ];

  if (Object.keys(promjene).some((polje) => !dopustenaPolja.includes(polje))) {
    return res.status(400).json({
      poruka: "Poslano je nedopušteno polje",
    });
  }

  if (
    promjene.nekretninaId !== undefined &&
    (!Number.isInteger(promjene.nekretninaId) || promjene.nekretninaId <= 0)
  ) {
    return res.status(400).json({
      poruka: "Neispravan ID nekretnine",
    });
  }

  if (
    promjene.nekretninaId !== undefined &&
    !nekretnine.some((n) => n.id === promjene.nekretninaId)
  ) {
    return res.status(404).json({
      poruka: "Nekretnina s navedenim ID-om ne postoji",
    });
  }

  for (const polje of ["ime", "prezime", "brojTelefona"]) {
    if (
      promjene[polje] !== undefined &&
      (typeof promjene[polje] !== "string" || !promjene[polje].trim())
    ) {
      return res.status(400).json({
        poruka: `Neispravno polje: ${polje}`,
      });
    }
  }

  if (
    promjene.cijena !== undefined &&
    (typeof promjene.cijena !== "number" ||
      !Number.isFinite(promjene.cijena) ||
      promjene.cijena <= 0)
  ) {
    return res.status(400).json({
      poruka: "Cijena mora biti pozitivan broj",
    });
  }

  for (const polje of Object.keys(promjene)) {
    ponuda[polje] =
      typeof promjene[polje] === "string"
        ? promjene[polje].trim()
        : promjene[polje];
  }

  res.status(200).json({
    poruka: "Ponuda uspješno djelomično ažurirana",
    ponuda: ponuda,
  });
});

// Brisanje ponude
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      poruka: "ID mora biti pozitivan cijeli broj",
    });
  }

  const index = ponude.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      poruka: "Ponuda s navedenim ID-om ne postoji",
    });
  }

  const obrisanaPonuda = ponude.splice(index, 1)[0];

  res.status(200).json({
    poruka: "Ponuda uspješno obrisana",
    ponuda: obrisanaPonuda,
  });
});

module.exports = router;
