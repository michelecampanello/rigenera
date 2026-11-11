// ==========================================================================
// Guida al riuso - Fondazione Rigenera
// I punti sono salvati nel localStorage del browser.
// - index.html  → legge i punti e li mostra nell'elenco
// - segnala.html → il modulo aggiunge un nuovo punto all'elenco
// I filtri restano in CSS: leggono gli attributi data- delle schede.
// ==========================================================================

const CHIAVE_STORAGE = "rigenera-punti";

// Testi da mostrare nelle etichette, a partire dai valori salvati
const NOMI_AZIONI = {
    ripara: "Riparare",
    dona: "Donare",
    scambia: "Scambiare",
    ricicla: "Riciclare"
};

const NOMI_CATEGORIE = {
    bici: "Bici",
    abbigliamento: "Vestiti e scarpe",
    elettronica: "Elettronica ed elettrodomestici",
    mobili: "Mobili",
    libri: "Libri e giochi",
    casa: "Casa e cucina",
    altro: "Altro"
};

const NOMI_ZONE = {
    centro: "Centro",
    nord: "Nord",
    sud: "Sud",
    est: "Est",
    ovest: "Ovest",
    "non-so": "Non indicata"
};

// Punti di esempio: usati solo la prima volta, quando il localStorage è vuoto
const PUNTI_INIZIALI = [
    {
        id: "raggi-liberi",
        nome: "Ciclofficina Raggi Liberi",
        azioni: ["ripara"],
        categorie: ["bici"],
        zona: "nord",
        indirizzo: "Via dei Mulini 14",
        orari: "Mar e Gio 17:00-20:00, Sab 10:00-13:00",
        descrizione: "Officina popolare dove volontari esperti ti aiutano a riparare la tua bici da solo, con attrezzi e pezzi di recupero a disposizione."
    },
    {
        id: "repair-cafe",
        nome: "Repair Café di Quartiere",
        azioni: ["ripara"],
        categorie: ["elettronica", "casa"],
        zona: "centro",
        indirizzo: "Piazza della Pace 3, sala civica",
        orari: "Primo sabato del mese, 15:00-18:00",
        descrizione: "Un pomeriggio al mese per riparare insieme piccoli elettrodomestici, lampade, radio e oggetti di casa. Ingresso libero."
    },
    {
        id: "emporio",
        nome: "Emporio Solidale",
        azioni: ["dona"],
        categorie: ["abbigliamento", "casa", "libri"],
        zona: "sud",
        indirizzo: "Via Garibaldi 88",
        orari: "Lun-Ven 9:00-12:30",
        descrizione: "Raccoglie vestiti puliti, stoviglie, biancheria e giocattoli in buono stato e li distribuisce alle famiglie in difficoltà."
    },
    {
        id: "armadio",
        nome: "Armadio Comune - swap party",
        azioni: ["scambia"],
        categorie: ["abbigliamento"],
        zona: "centro",
        indirizzo: "Biblioteca civica, Via Roma 21",
        orari: "Ultima domenica del mese, 10:00-13:00",
        descrizione: "Porta fino a 10 capi che non metti più e scegli qualcosa di nuovo per te. I capi non scambiati vengono donati."
    },
    {
        id: "raccolta-est",
        nome: "Centro di raccolta comunale Est",
        azioni: ["ricicla"],
        categorie: ["elettronica", "mobili", "casa"],
        zona: "est",
        indirizzo: "Via dell'Industria 5",
        orari: "Lun-Sab 8:00-12:00, Mer anche 14:00-17:00",
        descrizione: "Qui si portano rifiuti ingombranti, elettrodomestici e apparecchi elettronici (RAEE) non più riparabili. Gratuito per i residenti, porta un documento."
    },
    {
        id: "mercatino",
        nome: "Mercatino Seconda Mano",
        azioni: ["scambia", "dona"],
        categorie: ["mobili", "casa", "libri"],
        zona: "ovest",
        indirizzo: "Viale dei Tigli 40",
        orari: "Mer-Sab 9:30-12:30 e 15:30-19:00",
        descrizione: "Mercatino dell'usato gestito da una cooperativa sociale: puoi acquistare oggetti usati o lasciare in dono quelli che non ti servono più."
    },
    {
        id: "sartoria",
        nome: "Sartoria del Riuso",
        azioni: ["ripara"],
        categorie: ["abbigliamento"],
        zona: "ovest",
        indirizzo: "Via San Marco 7",
        orari: "Lun-Ven 15:00-19:00",
        descrizione: "Orli, cerniere, toppe e piccole modifiche a prezzi sociali. Il giovedì c'è un laboratorio per imparare a rammendare."
    },
    {
        id: "libri",
        nome: "Libri in Circolo",
        azioni: ["scambia", "dona"],
        categorie: ["libri"],
        zona: "nord",
        indirizzo: "Centro anziani, Via Verdi 12",
        orari: "Tutti i giorni 9:00-19:00",
        descrizione: "Scaffali di scambio libero: lascia un libro o un gioco da tavolo, prendine un altro. Si accettano anche donazioni."
    },
    {
        id: "falegnameria",
        nome: "Falegnameria Sociale Trucioli",
        azioni: ["ripara", "dona"],
        categorie: ["mobili"],
        zona: "sud",
        indirizzo: "Via delle Querce 22",
        orari: "Lun-Ven 8:30-17:00",
        descrizione: "Ripara sedie, tavoli e armadi. Ritira anche mobili in legno da sistemare e rimettere in circolo. Ritiro a domicilio su appuntamento."
    },
    {
        id: "biblioteca-oggetti",
        nome: "Biblioteca degli Oggetti",
        azioni: ["scambia"],
        categorie: ["casa", "elettronica"],
        zona: "ovest",
        indirizzo: "Via Mazzini 3",
        orari: "Mar e Ven 16:00-19:00",
        descrizione: "Trapano, scala, macchina per il pane? Invece di comprarli, prendili in prestito con la tessera gratuita."
    },
    {
        id: "ecosportello",
        nome: "Ecosportello Piccoli RAEE",
        azioni: ["ricicla"],
        categorie: ["elettronica"],
        zona: "centro",
        indirizzo: "Municipio, Piazza Grande 1 (piano terra)",
        orari: "Lun-Ven 8:30-13:00",
        descrizione: "Contenitori per pile, cellulari, caricabatterie e piccoli apparecchi elettronici. Il personale ti spiega come differenziarli."
    },
    {
        id: "cassonetti",
        nome: "Punto raccolta indumenti Est",
        azioni: ["ricicla", "dona"],
        categorie: ["abbigliamento"],
        zona: "est",
        indirizzo: "Parcheggio di Via Leopardi",
        orari: "Sempre accessibile",
        descrizione: "Contenitori per abiti, scarpe e borse, anche usurati: quelli in buono stato vengono riutilizzati, gli altri avviati al riciclo tessile. Usa sacchetti chiusi."
    }
];

// ---------- localStorage ----------

function leggiPunti() {
    try {
        const salvati = localStorage.getItem(CHIAVE_STORAGE);
        if (salvati) {
            return JSON.parse(salvati);
        }
    } catch (errore) {
        console.warn("Impossibile leggere i punti salvati:", errore);
    }
    // Prima visita (o dati non leggibili): si parte dai punti di esempio
    salvaPunti(PUNTI_INIZIALI);
    return PUNTI_INIZIALI;
}

function salvaPunti(punti) {
    try {
        localStorage.setItem(CHIAVE_STORAGE, JSON.stringify(punti));
        return true;
    } catch (errore) {
        console.warn("Impossibile salvare i punti:", errore);
        return false;
    }
}

// ---------- Elenco (index.html) ----------

// Evita che il testo scritto dagli utenti venga interpretato come HTML
function escapeHtml(testo) {
    const div = document.createElement("div");
    div.textContent = testo;
    return div.innerHTML;
}

function creaScheda(punto) {
    const idTitolo = "p-" + punto.id;

    const etichetteAzioni = punto.azioni
        .map(azione => `<li class="etichetta etichetta--${azione}">${NOMI_AZIONI[azione]}</li>`)
        .join("");

    const etichetteCategorie = punto.categorie
        .map(categoria => `<li class="etichetta">${NOMI_CATEGORIE[categoria]}</li>`)
        .join("");

    // Gli orari sono facoltativi: la riga compare solo se ci sono
    const rigaOrari = punto.orari
        ? `<div><dt>Orari</dt><dd>${escapeHtml(punto.orari)}</dd></div>`
        : "";

    return `
        <li class="punto" data-azione="${punto.azioni.join(" ")}" data-categoria="${punto.categorie.join(" ")}" data-zona="${punto.zona}">
            <article class="scheda" aria-labelledby="${idTitolo}">
                <h3 id="${idTitolo}">${escapeHtml(punto.nome)}</h3>
                <ul class="etichette" aria-label="Cosa puoi fare e quali oggetti">
                    ${etichetteAzioni}
                    ${etichetteCategorie}
                </ul>
                <p class="scheda__descrizione">${escapeHtml(punto.descrizione)}</p>
                <dl class="scheda__info">
                    <div><dt>Zona</dt><dd>${NOMI_ZONE[punto.zona]}</dd></div>
                    <div><dt>Indirizzo</dt><dd>${escapeHtml(punto.indirizzo)}</dd></div>
                    ${rigaOrari}
                </dl>
            </article>
        </li>
    `;
}

function mostraPunti(elenco) {
    const punti = leggiPunti();
    elenco.innerHTML = punti.map(creaScheda).join("");
}

// ---------- Modulo di segnalazione (segnala.html) ----------

// Crea un id univoco a partire dal nome, es. "Bar Sport" → "bar-sport-1731350000000"
function creaId(nome) {
    const base = nome
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "") // toglie gli accenti
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return base + "-" + Date.now();
}

function gestisciModulo(modulo) {
    const messaggio = document.getElementById("messaggio-modulo");

    modulo.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const dati = new FormData(modulo);

        // Campo-trappola: se è compilato è quasi sicuramente un bot
        if (dati.get("_gotcha")) {
            return;
        }

        const azioni = dati.getAll("azione");
        const categorie = dati.getAll("categoria");

        // Senza almeno un'azione il punto non comparirebbe in nessun filtro
        if (azioni.length === 0) {
            messaggio.textContent = "Scegli almeno una cosa che si può fare in questo punto.";
            messaggio.className = "messaggio messaggio--errore";
            modulo.querySelector('input[name="azione"]').focus();
            return;
        }

        const nuovoPunto = {
            id: creaId(dati.get("nome_punto")),
            nome: dati.get("nome_punto").trim(),
            azioni: azioni,
            categorie: categorie.length > 0 ? categorie : ["altro"],
            zona: dati.get("zona"),
            indirizzo: dati.get("indirizzo").trim(),
            orari: dati.get("orari").trim(),
            descrizione: dati.get("descrizione").trim(),
            sito: dati.get("sito").trim(),
            segnalatoDa: dati.get("nome").trim(),
            email: dati.get("email").trim(),
            dataSegnalazione: new Date().toISOString()
        };

        const punti = leggiPunti();
        punti.push(nuovoPunto);

        if (salvaPunti(punti)) {
            modulo.reset();
            messaggio.innerHTML = `Grazie! <strong>${escapeHtml(nuovoPunto.nome)}</strong> è stato aggiunto alla guida. <a href="index.html#risultati">Vai all'elenco dei punti</a>.`;
            messaggio.className = "messaggio messaggio--successo";
        } else {
            messaggio.textContent = "Non è stato possibile salvare la segnalazione. Controlla che il browser permetta di salvare i dati del sito e riprova.";
            messaggio.className = "messaggio messaggio--errore";
        }
        messaggio.focus();
    });
}

// ---------- Avvio: ogni pagina usa solo la parte che le serve ----------

const elencoPunti = document.getElementById("elenco-punti");
if (elencoPunti) {
    mostraPunti(elencoPunti);
}

const moduloSegnala = document.getElementById("modulo-segnala");
if (moduloSegnala) {
    gestisciModulo(moduloSegnala);
}