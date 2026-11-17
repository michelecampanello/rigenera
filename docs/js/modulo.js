// ==========================================================================
// Modulo di segnalazione (segnala.html)
// Crea le caselle dagli stessi GRUPPI_FILTRI della guida, controlla i campi
// con validazione.js e salva la segnalazione nel localStorage.
// Usa: comune.js, validazione.js (validaModulo).
// ==========================================================================


// Crea un id univoco a partire dal nome, es. "Bar Sport" → "bar-sport-1731350000000"
function creaId(nome) {
    const base = nome
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // toglie gli accenti
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return base + "-" + Date.now();
}

// Le caselle (azioni, categorie) e le opzioni della zona nascono dagli stessi
// GRUPPI_FILTRI della guida: una nuova voce compare sia nei filtri sia qui.
function vociModulo(gruppo) {
    const etichette = Object.assign({}, gruppo.etichette, gruppo.etichetteModulo);
    return Object.entries(gruppo.voci).map(([valore, nome]) => [valore, etichette[valore] || nome]);
}

function creaCampiModulo(modulo) {
    GRUPPI_FILTRI.forEach(gruppo => {
        const contenitore = modulo.querySelector(`[data-gruppo="${gruppo.nome}"]`);
        if (!contenitore) {
            return;
        }
        const voci = vociModulo(gruppo);
        if (contenitore.tagName === "SELECT") {
            // Si aggiungono dopo l'opzione "Scegli una zona", che resta la prima
            voci.forEach(([valore, testo]) => contenitore.add(new Option(testo, valore)));
        } else {
            contenitore.insertAdjacentHTML("beforeend", voci
                .map(([valore, testo]) =>
                    `<label class="scelta"><input type="checkbox" name="${gruppo.nome}" value="${valore}"> ${testo}</label>`)
                .join(""));
        }
    });
}

function gestisciModulo(modulo) {
    creaCampiModulo(modulo);

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

        // Controlla tutti i campi: se c'è un errore lo mostra sotto il campo e si ferma
        if (!validaModulo(modulo)) {
            messaggio.textContent = "";
            messaggio.className = "messaggio";
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

        const segnalazioni = leggiSegnalazioni();
        segnalazioni.push(nuovoPunto);

        if (salvaSegnalazioni(segnalazioni)) {
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
