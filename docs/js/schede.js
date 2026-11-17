// ==========================================================================
// Schede dell'elenco (index.html)
// Trasforma i punti di data.js e le segnalazioni in schede HTML.
// Usa: comune.js (escapeHtml, sitoSicuro), preferiti.js (creaBottonePreferito).
// ==========================================================================

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

function mostraPunti(elenco, punti) {
    elenco.innerHTML = punti.map(creaScheda).join("");
}
