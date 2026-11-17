// ==========================================================================
// Guida al riuso - Fondazione Rigenera: parti comuni alle due pagine
// Configurazione dei filtri, segnalazioni salvate nel browser e funzioni
// di sicurezza per il testo. Si carica dopo data.js e prima degli altri file.
//
// Gli script del sito NON sono moduli (import/export): i moduli non
// funzionano aprendo la pagina con un doppio clic (indirizzo file://).
// Sono file normali con "defer", eseguiti nell'ordine dei <script>:
// ogni file può usare le funzioni dei file caricati prima.
// ==========================================================================

// Nel localStorage restano solo le segnalazioni dei cittadini, non tutto
// l'elenco: così un punto aggiunto in data.js compare anche a chi è già
// passato dal sito.
const CHIAVE_SEGNALAZIONI = "rigenera-segnalazioni";

// I tre gruppi di filtri, nell'ordine in cui la persona si pone le domande.
// "campo" è la proprietà del punto da controllare, "tutti" il testo della prima opzione del menu, che azzera il gruppo.
// "etichette" permette di usare nei filtri e nel modulo un testo diverso da quello delle schede,
// "etichetteModulo" un testo diverso solo nel modulo di segnalazione.
const GRUPPI_FILTRI = [
    { nome: "azione", campo: "azioni", tutti: "Tutto", voci: NOMI_AZIONI,
      etichette: { scambia: "Scambiare o comprare usato" } },
    { nome: "categoria", campo: "categorie", tutti: "Tutti", voci: NOMI_CATEGORIE },
    { nome: "zona", campo: "zona", tutti: "Tutte", voci: NOMI_ZONE,
      etichetteModulo: { "non-so": "Non lo so" } }
];

// Valore dell'opzione "Tutto/Tutti/Tutte"
const TUTTI = "";

// ---------- localStorage ----------

// Restituisce sempre un array. Al primo avvio getItem dà null e
// JSON.parse(null) dà null: in quel caso, o se i dati sono rovinati,
// non ci sono ancora segnalazioni.
function leggiSegnalazioni() {
    try {
        const salvate = JSON.parse(localStorage.getItem(CHIAVE_SEGNALAZIONI));
        return Array.isArray(salvate) ? salvate : [];
    } catch (errore) {
        return [];
    }
}

function salvaSegnalazioni(segnalazioni) {
    try {
        localStorage.setItem(CHIAVE_SEGNALAZIONI, JSON.stringify(segnalazioni));
        return true;
    } catch (errore) {
        return false;
    }
}

// Tutti i punti da mostrare: quelli della guida (data.js) e le segnalazioni
function leggiPunti() {
    return PUNTI_GUIDA.concat(leggiSegnalazioni());
}

// ---------- Sicurezza del testo ----------

// Evita che il testo scritto dagli utenti venga interpretato come HTML
function escapeHtml(testo) {
    const div = document.createElement("div");
    div.textContent = testo;
    return div.innerHTML;
}

// Accetta solo link http/https: blocca indirizzi come "javascript:..."
function sitoSicuro(sito) {
    if (!sito) {
        return "";
    }
    try {
        const url = new URL(sito);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch (errore) {
        return "";
    }
}
