// ==========================================================================
// Dati della Guida al riuso
// Questo file contiene SOLO dati, nessuna logica: per aggiungere o
// modificare un punto basta cambiare l'array PUNTI_GUIDA qui sotto.
//
// Forma di ogni punto:
//   id          testo unico e stabile, minuscolo con trattini. Non cambiarlo
//               mai: i preferiti degli utenti sono salvati per id.
//   nome        nome del punto
//   azioni      una o più chiavi di NOMI_AZIONI (es. ["ripara", "dona"])
//   categorie   una o più chiavi di NOMI_CATEGORIE (es. ["bici"])
//   zona        una chiave di NOMI_ZONE (es. "centro")
//   indirizzo, orari, descrizione   testo libero
//   sito        facoltativo, indirizzo completo http:// o https://
//
// Le chiavi si scrivono sempre uguali, in minuscolo: per il codice
// "Ripara" e "ripara" sono due cose diverse.
// Per una nuova categoria o zona basta aggiungere una voce ai NOMI qui
// sotto: compare da sola nei filtri e nel modulo di segnalazione.
// ==========================================================================

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

const PUNTI_GUIDA = [
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
    },
    {
        id: "ludoteca",
        nome: "Ludoteca del Riuso",
        azioni: ["scambia", "dona"],
        categorie: ["libri"],
        zona: "est",
        indirizzo: "Via Pascoli 27, centro civico",
        orari: "Mer 16:00-18:30, Sab 10:00-12:30",
        descrizione: "Giocattoli, giochi da tavolo e puzzle completi passano da una famiglia all'altra: porti quelli che non usate più e ne scegli altri."
    },
    {
        id: "seconda-accensione",
        nome: "Laboratorio Seconda Accensione",
        azioni: ["ripara"],
        categorie: ["elettronica", "casa"],
        zona: "sud",
        indirizzo: "Via Manzoni 45",
        orari: "Lun-Ven 9:00-12:30 e 15:00-18:30",
        descrizione: "Laboratorio artigiano che ripara lavatrici, aspirapolvere e piccoli elettrodomestici. Preventivo gratuito prima di decidere se conviene."
    },
    {
        id: "ritiro-ingombranti",
        nome: "Ritiro ingombranti a domicilio",
        azioni: ["ricicla"],
        categorie: ["mobili", "elettronica"],
        zona: "non-so",
        indirizzo: "Servizio comunale in tutta la città, su prenotazione",
        orari: "Prenotazioni Lun-Sab 8:00-14:00",
        descrizione: "Il Comune passa a ritirare sotto casa mobili, materassi e grandi elettrodomestici. Gratuito fino a 5 pezzi per volta."
    },
    {
        id: "olio-cucina",
        nome: "Raccolta olio da cucina",
        azioni: ["ricicla"],
        categorie: ["altro"],
        zona: "nord",
        indirizzo: "Piazza del Mercato, accanto all'edicola",
        orari: "Sempre accessibile",
        descrizione: "Porta l'olio di frittura e quello dei sottoli in una bottiglia di plastica chiusa: diventa biodiesel e sapone invece di inquinare l'acqua."
    }
];
