// ==========================================================================
// Guida al riuso - Fondazione Rigenera
// I punti sono salvati nel localStorage del browser.
// - index.html  → legge i punti e li mostra nell'elenco
// - segnala.html → il modulo aggiunge un nuovo punto all'elenco
// I filtri sono generati da NOMI_AZIONI, NOMI_CATEGORIE e NOMI_ZONE:
// per aggiungere una categoria o una zona basta una voce qui sotto.
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

// I tre gruppi di filtri, nell'ordine in cui la persona si pone le domande.
// "campo" è la proprietà del punto da controllare, "tutti" il testo della pillola che azzera il gruppo.
// "etichette" permette di usare nei filtri e nel modulo un testo diverso da quello delle schede,
// "etichetteModulo" un testo diverso solo nel modulo di segnalazione.
const GRUPPI_FILTRI = [
    { nome: "azione", campo: "azioni", tutti: "Tutto", voci: NOMI_AZIONI,
      etichette: { scambia: "Scambiare o comprare usato" } },
    { nome: "categoria", campo: "categorie", tutti: "Tutti", voci: NOMI_CATEGORIE },
    { nome: "zona", campo: "zona", tutti: "Tutte", voci: NOMI_ZONE,
      etichetteModulo: { "non-so": "Non lo so" } }
];

// Valore della pillola "Tutto/Tutti/Tutte"
const TUTTI = "";

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

    // Il sito è facoltativo: compare solo se è un indirizzo http/https valido
    const indirizzoSito = sitoSicuro(punto.sito);
    const rigaSito = indirizzoSito
        ? `<div><dt>Sito</dt><dd><a href="${escapeHtml(indirizzoSito)}" target="_blank" rel="noopener noreferrer">${escapeHtml(new URL(indirizzoSito).hostname)}<span class="solo-lettori"> (si apre in una nuova scheda)</span></a></dd></div>`
        : "";

    return `
        <li class="punto" data-id="${escapeHtml(punto.id)}" data-azione="${punto.azioni.join(" ")}" data-categoria="${punto.categorie.join(" ")}" data-zona="${punto.zona}">
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
                    ${rigaSito}
                </dl>
                <div class="scheda__azioni">
                    ${creaBottonePreferito(punto)}
                </div>
            </article>
        </li>
    `;
}

function mostraPunti(elenco, punti) {
    elenco.innerHTML = punti.map(creaScheda).join("");
}

// ---------- Filtri (index.html) ----------

// Un punto supera il filtro di un gruppo se il valore scelto è "Tutti"
// oppure se è tra i suoi valori (azioni e categorie sono elenchi, la zona è un valore solo)
function superaGruppo(punto, gruppo, valore) {
    if (valore === TUTTI) {
        return true;
    }
    const valoriPunto = [].concat(punto[gruppo.campo]);
    return valoriPunto.includes(valore);
}

// Minuscolo e senza accenti: "Caffè" e "caffe" diventano uguali
function normalizzaTesto(testo) {
    return testo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Ricerca libera su nome, descrizione e indirizzo.
// Con più parole ("bici nord") il punto deve contenerle tutte.
function superaRicerca(punto, testo) {
    if (!testo) {
        return true;
    }
    const testoPunto = normalizzaTesto([punto.nome, punto.descrizione, punto.indirizzo].join(" "));
    return testo.split(/\s+/).every(parola => testoPunto.includes(parola));
}

// "preferiti" è null se la casella "Solo i miei preferiti" non è spuntata
function superaPreferiti(punto, preferiti) {
    return !preferiti || preferiti.includes(punto.id);
}

function superaFiltri(punto, scelte, gruppoDaIgnorare) {
    return superaRicerca(punto, scelte.testo)
        && superaPreferiti(punto, scelte.preferiti)
        && GRUPPI_FILTRI.every(gruppo =>
            gruppo === gruppoDaIgnorare || superaGruppo(punto, gruppo, scelte[gruppo.nome])
        );
}

function creaPillola(gruppo, valore, testo) {
    const selezionata = valore === TUTTI ? " checked" : "";
    return `
        <label class="chip">
            <input type="radio" name="${gruppo.nome}" value="${valore}"${selezionata}>
            <span>${testo} <span class="chip__conteggio"></span></span>
        </label>
    `;
}

function creaPillole(filtri) {
    GRUPPI_FILTRI.forEach(gruppo => {
        const contenitore = filtri.querySelector(`[data-gruppo="${gruppo.nome}"]`);
        if (!contenitore) {
            return;
        }
        const etichette = gruppo.etichette || {};
        const pillole = Object.entries(gruppo.voci)
            .map(([valore, nome]) => creaPillola(gruppo, valore, etichette[valore] || nome));
        contenitore.innerHTML = creaPillola(gruppo, TUTTI, gruppo.tutti) + pillole.join("");
    });
}

function leggiScelte(filtri) {
    const scelte = {};
    GRUPPI_FILTRI.forEach(gruppo => {
        const selezionato = filtri.querySelector(`input[name="${gruppo.nome}"]:checked`);
        scelte[gruppo.nome] = selezionato ? selezionato.value : TUTTI;
    });

    const campoRicerca = filtri.querySelector('input[name="testo"]');
    scelte.testo = campoRicerca ? normalizzaTesto(campoRicerca.value.trim()) : "";

    const soloPreferiti = filtri.querySelector('input[name="solo-preferiti"]');
    scelte.preferiti = soloPreferiti && soloPreferiti.checked ? leggiPreferiti() : null;

    return scelte;
}

// Mostra solo le schede che superano tutti i filtri e restituisce quante sono
function applicaFiltri(filtri, elenco, punti) {
    const scelte = leggiScelte(filtri);
    let visibili = 0;

    punti.forEach(punto => {
        const scheda = elenco.querySelector(`[data-id="${CSS.escape(punto.id)}"]`);
        const visibile = superaFiltri(punto, scelte);
        if (scheda) {
            scheda.hidden = !visibile;
        }
        if (visibile) {
            visibili++;
        }
    });

    aggiornaConteggiPillole(filtri, punti, scelte);
    return visibili;
}

// Accanto a ogni pillola: quanti punti si troverebbero scegliendola,
// tenendo fermi gli altri due gruppi di filtri
function aggiornaConteggiPillole(filtri, punti, scelte) {
    GRUPPI_FILTRI.forEach(gruppo => {
        const candidati = punti.filter(punto => superaFiltri(punto, scelte, gruppo));
        filtri.querySelectorAll(`input[name="${gruppo.nome}"]`).forEach(input => {
            const quanti = candidati.filter(punto => superaGruppo(punto, gruppo, input.value)).length;
            const pillola = input.closest(".chip");
            pillola.querySelector(".chip__conteggio").innerHTML =
                `${quanti}<span class="solo-lettori"> ${quanti === 1 ? "punto" : "punti"}</span>`;
            pillola.classList.toggle("chip--vuota", quanti === 0);
        });
    });
}

// ---------- Annuncio dei risultati (lettori di schermo) ----------
// Il numero viene scritto nella regione aria-live, che il lettore di schermo legge da solo.

function annunciaRisultati(annuncio, visibili) {
    if (visibili === 0) {
        annuncio.textContent = "Nessun punto trovato con questi filtri.";
    } else if (visibili === 1) {
        annuncio.textContent = "1 punto trovato.";
    } else {
        annuncio.textContent = visibili + " punti trovati.";
    }
}

// Messaggio visibile a schermo quando nessun punto supera ricerca e filtri
// (l'annuncio aria-live sopra resta per i lettori di schermo)
function mostraNessunRisultato(riquadro, visibili, scelte) {
    if (!riquadro) {
        return;
    }
    riquadro.hidden = visibili > 0;
    if (visibili > 0) {
        return;
    }
    if (scelte.preferiti && scelte.preferiti.length === 0) {
        riquadro.textContent = "Non hai ancora salvato nessun punto. Premi «♡ Preferito» su una scheda per ritrovarla qui.";
    } else {
        riquadro.textContent = "Nessun punto corrisponde alla ricerca e ai filtri scelti. Prova con un'altra parola o scegli «Tutto» in uno dei filtri.";
    }
}

// Restituisce la funzione che riapplica i filtri, usata anche dai preferiti
function gestisciFiltri(filtri, elenco, annuncio, punti, nessunRisultato) {
    creaPillole(filtri);
    // Al caricamento: solo conteggi e messaggio, nessun annuncio
    const visibiliIniziali = applicaFiltri(filtri, elenco, punti);
    mostraNessunRisultato(nessunRisultato, visibiliIniziali, leggiScelte(filtri));

    const aggiorna = () => {
        const visibili = applicaFiltri(filtri, elenco, punti);
        mostraNessunRisultato(nessunRisultato, visibili, leggiScelte(filtri));
        if (annuncio) {
            annunciaRisultati(annuncio, visibili);
        }
    };

    filtri.addEventListener("change", aggiorna);

    // La ricerca si aggiorna mentre si scrive, con una piccola pausa
    // per non far annunciare al lettore di schermo ogni singola lettera
    let attesa;
    filtri.addEventListener("input", evento => {
        if (evento.target.name !== "testo") {
            return;
        }
        clearTimeout(attesa);
        attesa = setTimeout(aggiorna, 300);
    });

    // Invio nel campo di ricerca: niente ricaricamento della pagina
    filtri.addEventListener("submit", evento => evento.preventDefault());

    // L'evento "reset" arriva prima che i campi tornino ai valori iniziali:
    // si aspetta il ciclo successivo per leggere le scelte giuste
    filtri.addEventListener("reset", () => setTimeout(aggiorna));

    return aggiorna;
}

// ---------- Modulo di segnalazione (segnala.html) ----------

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
    const punti = leggiPunti();
    mostraPunti(elencoPunti, punti);

    const filtri = document.querySelector(".filtri");
    let aggiornaFiltri = () => {};
    if (filtri) {
        aggiornaFiltri = gestisciFiltri(
            filtri,
            elencoPunti,
            document.getElementById("annuncio-risultati"),
            punti,
            document.getElementById("nessun-risultato")
        );
    }
    gestisciPreferiti(elencoPunti, aggiornaFiltri);
}

const moduloSegnala = document.getElementById("modulo-segnala");
if (moduloSegnala) {
    gestisciModulo(moduloSegnala);
}