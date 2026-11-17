// ==========================================================================
// Guida al riuso - Fondazione Rigenera
// I punti della guida sono in data.js (caricato prima di questo file).
// - index.html  → mostra i punti di data.js più quelli segnalati dai cittadini
// - segnala.html → il modulo salva la segnalazione nel localStorage del browser
// I filtri sono generati da NOMI_AZIONI, NOMI_CATEGORIE e NOMI_ZONE di data.js.
// ==========================================================================

// Nel localStorage restano solo le segnalazioni dei cittadini, non tutto
// l'elenco: così un punto aggiunto in data.js compare anche a chi è già
// passato dal sito.
const CHIAVE_SEGNALAZIONI = "rigenera-segnalazioni";

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

// Righe dei dettagli (zona, indirizzo, orari, sito): usate dalla finestra
// dei dettagli e dalla versione stampata della scheda
function creaInfo(punto) {
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
        <dl class="scheda__info">
            <div><dt>Zona</dt><dd>${NOMI_ZONE[punto.zona]}</dd></div>
            <div><dt>Indirizzo</dt><dd>${escapeHtml(punto.indirizzo)}</dd></div>
            ${rigaOrari}
            ${rigaSito}
        </dl>
    `;
}

function creaEtichetteAzioni(punto) {
    return punto.azioni
        .map(azione => `<li class="etichetta etichetta--${azione}">${NOMI_AZIONI[azione]}</li>`)
        .join("");
}

function creaEtichetteCategorie(punto) {
    return punto.categorie
        .map(categoria => `<li class="etichetta">${NOMI_CATEGORIE[categoria]}</li>`)
        .join("");
}

// La scheda nell'elenco è essenziale: nome, cosa si può fare, dove.
// Il nome è un bottone che apre la finestra con tutti i dettagli;
// con il CSS tutta la scheda diventa cliccabile.
// I dettagli completi restano nella scheda solo per la stampa.
function creaScheda(punto) {
    const idTitolo = "p-" + punto.id;

    return `
        <li class="punto" data-id="${escapeHtml(punto.id)}" data-azione="${punto.azioni.join(" ")}" data-categoria="${punto.categorie.join(" ")}" data-zona="${punto.zona}">
            <article class="scheda" aria-labelledby="${idTitolo}">
                <h3 id="${idTitolo}">
                    <button type="button" class="scheda__apri" data-id="${escapeHtml(punto.id)}" aria-haspopup="dialog">${escapeHtml(punto.nome)}</button>
                </h3>
                <ul class="etichette" aria-label="Cosa puoi fare">
                    ${creaEtichetteAzioni(punto)}
                </ul>
                <p class="scheda__dove">
                    <span class="solo-lettori">Dove: </span>${NOMI_ZONE[punto.zona]} · ${escapeHtml(punto.indirizzo)}
                </p>
                <div class="scheda__piede">
                    <span class="scheda__dettagli" aria-hidden="true">Dettagli <span class="scheda__freccia">→</span></span>
                    ${creaBottonePreferito(punto, true)}
                </div>
                <div class="solo-stampa">
                    <ul class="etichette">${creaEtichetteCategorie(punto)}</ul>
                    <p>${escapeHtml(punto.descrizione)}</p>
                    ${creaInfo(punto)}
                </div>
            </article>
        </li>
    `;
}

// ---------- Finestra dei dettagli (index.html) ----------
// Usa l'elemento <dialog> del browser: con showModal() il focus resta
// dentro la finestra, Esc la chiude e il resto della pagina non si può
// usare finché è aperta (anche dai lettori di schermo).

function creaDettaglio(punto) {
    return `
        <div class="dettaglio__testa">
            <button type="button" class="dettaglio__chiudi" data-chiudi>
                <span aria-hidden="true">✕</span> Chiudi
            </button>
        </div>
        <div class="dettaglio__corpo">
            <h2 id="dettaglio-titolo">${escapeHtml(punto.nome)}</h2>
            <ul class="etichette" aria-label="Cosa puoi fare e quali oggetti">
                ${creaEtichetteAzioni(punto)}
                ${creaEtichetteCategorie(punto)}
            </ul>
            <p class="dettaglio__descrizione">${escapeHtml(punto.descrizione)}</p>
            ${creaInfo(punto)}
            <div class="dettaglio__azioni">
                ${creaBottonePreferito(punto)}
            </div>
        </div>
    `;
}

function gestisciDettaglio(finestra, elenco, punti) {
    if (!finestra || typeof finestra.showModal !== "function") {
        return;
    }
    let apertoDa = null;

    elenco.addEventListener("click", evento => {
        const bottone = evento.target.closest(".scheda__apri");
        if (!bottone) {
            return;
        }
        const punto = punti.find(p => p.id === bottone.dataset.id);
        if (!punto) {
            return;
        }
        apertoDa = bottone;
        finestra.dataset.azione = punto.azioni.join(" ");
        finestra.innerHTML = creaDettaglio(punto);
        finestra.showModal();
        // Il focus va sul titolo: il lettore di schermo legge subito il nome del punto
        // (il bottone "Chiudi" resta il primo elemento raggiungibile con Tab)
        const titolo = finestra.querySelector("h2");
        titolo.tabIndex = -1;
        titolo.focus();
    });

    // Chiude con il bottone "Chiudi" o con un clic sullo sfondo scuro fuori dalla finestra
    finestra.addEventListener("click", evento => {
        if (evento.target === finestra || evento.target.closest("[data-chiudi]")) {
            finestra.close();
        }
    });

    // Alla chiusura il focus torna sulla scheda da cui si era partiti
    finestra.addEventListener("close", () => {
        if (!apertoDa) {
            return;
        }
        // Se intanto la scheda è stata nascosta (tolta dai preferiti con
        // "Solo i miei preferiti" attivo), il focus va all'elenco
        const punto = apertoDa.closest(".punto");
        if (punto && !punto.hidden) {
            apertoDa.focus();
        } else {
            const sezione = document.getElementById("risultati");
            if (sezione) {
                sezione.focus();
            }
        }
    });
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

function testoPunti(quanti) {
    if (quanti === 0) {
        return "Nessun punto";
    }
    return quanti === 1 ? "1 punto" : quanti + " punti";
}

// ---------- Filtri compatti sui telefoni ----------
// Sugli schermi piccoli i gruppi di filtri stanno in un pannello che si apre
// con il bottone "Filtri" accanto alla ricerca. Sopra l'elenco restano solo
// le pillole dei filtri attivi, che si tolgono con un tocco.
// Senza JavaScript il pannello resta sempre aperto.

const SCHERMO_LARGO = window.matchMedia("(min-width: 62rem)");

// I filtri scelti, come elenco di { testo, togli }: "togli" li riporta a "Tutti"
function filtriAttivi(filtri) {
    const attivi = [];
    GRUPPI_FILTRI.forEach(gruppo => {
        const scelto = filtri.querySelector(`input[name="${gruppo.nome}"]:checked`);
        if (!scelto || scelto.value === TUTTI) {
            return;
        }
        const etichette = gruppo.etichette || {};
        attivi.push({
            testo: etichette[scelto.value] || gruppo.voci[scelto.value],
            togli: () => { filtri.querySelector(`input[name="${gruppo.nome}"][value="${TUTTI}"]`).checked = true; }
        });
    });

    const ricerca = filtri.querySelector('input[name="testo"]');
    if (ricerca && ricerca.value.trim()) {
        attivi.push({ testo: "«" + ricerca.value.trim() + "»", togli: () => { ricerca.value = ""; } });
    }

    const preferiti = filtri.querySelector('input[name="solo-preferiti"]');
    if (preferiti && preferiti.checked) {
        attivi.push({ testo: "Solo preferiti", togli: () => { preferiti.checked = false; } });
    }
    return attivi;
}

function mostraFiltriAttivi(filtri, contenitore, aggiorna) {
    const attivi = filtriAttivi(filtri);
    contenitore.hidden = attivi.length === 0;
    contenitore.innerHTML = "";
    attivi.forEach(filtro => {
        const bottone = document.createElement("button");
        bottone.type = "button";
        bottone.className = "filtro-attivo";
        bottone.innerHTML = `${escapeHtml(filtro.testo)} <span aria-hidden="true">✕</span>`;
        bottone.setAttribute("aria-label", "Togli il filtro " + filtro.testo);
        bottone.addEventListener("click", () => {
            filtro.togli();
            aggiorna();
            // Il bottone sparisce: il focus passa al campo di ricerca
            filtri.querySelector('input[name="testo"]').focus();
        });
        contenitore.append(bottone);
    });

    const numero = filtri.querySelector(".apri-filtri__numero");
    if (numero) {
        numero.hidden = attivi.length === 0;
        numero.innerHTML = `${attivi.length}<span class="solo-lettori"> attivi</span>`;
    }
}

function gestisciPannello(filtri) {
    const apri = filtri.querySelector(".apri-filtri");
    const pannello = filtri.querySelector(".filtri__pannello");
    const mostra = filtri.querySelector(".mostra-punti");
    if (!apri || !pannello) {
        return;
    }

    const imposta = aperto => {
        apri.setAttribute("aria-expanded", String(aperto));
        filtri.classList.toggle("filtri--chiusi", !aperto);
    };

    apri.hidden = false;
    if (mostra) {
        mostra.hidden = false;
    }
    imposta(false);

    apri.addEventListener("click", () => {
        const aperto = apri.getAttribute("aria-expanded") !== "true";
        imposta(aperto);
        if (aperto) {
            // Nelle righe che scorrono di lato, la pillola scelta deve essere in vista
            pannello.querySelectorAll(".chips input:checked").forEach(input =>
                input.closest(".chip").scrollIntoView({ block: "nearest", inline: "nearest" }));
            pannello.querySelector("input").focus({ preventScroll: true });
        }
    });

    // "Mostra i punti": chiude il pannello e porta all'elenco
    if (mostra) {
        mostra.addEventListener("click", () => {
            imposta(false);
            const risultati = document.getElementById("risultati");
            if (risultati) {
                risultati.focus();
                risultati.scrollIntoView({ block: "start" });
            }
        });
    }
}

// Restituisce la funzione che riapplica i filtri, usata anche dai preferiti
function gestisciFiltri(filtri, elenco, annuncio, punti, nessunRisultato) {
    creaPillole(filtri);
    gestisciPannello(filtri);

    const conteggio = document.getElementById("conteggio-risultati");
    const contenitoreAttivi = filtri.querySelector(".filtri-attivi");
    const mostra = filtri.querySelector(".mostra-punti");

    // Aggiorna tutto quello che dipende dai filtri; "annuncia" è falso al caricamento
    const aggiorna = (annuncia = true) => {
        const visibili = applicaFiltri(filtri, elenco, punti);
        mostraNessunRisultato(nessunRisultato, visibili, leggiScelte(filtri));
        if (conteggio) {
            conteggio.hidden = false;
            conteggio.textContent = visibili === punti.length
                ? `${testoPunti(visibili)} in tutto`
                : `${testoPunti(visibili)} su ${punti.length}`;
        }
        if (mostra) {
            mostra.textContent = visibili === 0 ? "Nessun punto" : `Vedi ${testoPunti(visibili).toLowerCase()}`;
        }
        if (contenitoreAttivi) {
            mostraFiltriAttivi(filtri, contenitoreAttivi, aggiorna);
        }
        if (annuncia && annuncio) {
            annunciaRisultati(annuncio, visibili);
        }
    };

    // Al caricamento: solo conteggi e messaggio, nessun annuncio
    aggiorna(false);

    filtri.addEventListener("change", () => aggiorna());

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
    const finestraDettaglio = document.getElementById("dettaglio");
    gestisciDettaglio(finestraDettaglio, elencoPunti, punti);
    gestisciPreferiti([elencoPunti, finestraDettaglio], aggiornaFiltri);
}

const moduloSegnala = document.getElementById("modulo-segnala");
if (moduloSegnala) {
    gestisciModulo(moduloSegnala);
}
