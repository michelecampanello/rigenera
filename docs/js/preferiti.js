// ==========================================================================
// Preferiti
// Ogni scheda ha il bottone "♡ Preferito". Nel localStorage si salva solo
// l'elenco degli id dei punti (stabili), non le schede intere: se un punto
// cambia orari o descrizione, il preferito resta valido.
// ==========================================================================

const CHIAVE_PREFERITI = "rigenera-preferiti";

// Restituisce sempre un array di id.
// Al primo avvio getItem restituisce null e JSON.parse(null) dà null:
// in quel caso, o se i dati sono rovinati, si parte da un elenco vuoto.
function leggiPreferiti() {
    try {
        const salvati = JSON.parse(localStorage.getItem(CHIAVE_PREFERITI));
        return Array.isArray(salvati) ? salvati : [];
    } catch (errore) {
        return [];
    }
}

// localStorage salva solo testo: l'array va trasformato in stringa JSON
function salvaPreferiti(preferiti) {
    try {
        localStorage.setItem(CHIAVE_PREFERITI, JSON.stringify(preferiti));
        return true;
    } catch (errore) {
        return false;
    }
}

function ePreferito(id) {
    return leggiPreferiti().includes(id);
}

// Aggiunge il punto se non c'è, lo toglie se c'è già.
// Restituisce lo stato dopo il clic (true = è tra i preferiti).
function cambiaPreferito(id) {
    const preferiti = leggiPreferiti();
    const attivo = !preferiti.includes(id);
    const aggiornati = attivo
        ? preferiti.concat(id)
        : preferiti.filter(idSalvato => idSalvato !== id);
    // Se il salvataggio non riesce, lo stato resta quello di prima
    return salvaPreferiti(aggiornati) ? attivo : !attivo;
}

// Bottone "interruttore": il testo resta uguale, aria-pressed dice se è attivo.
// Il cuore pieno o vuoto lo mostra anche a chi non distingue i colori.
// "compatto" (nelle schede dell'elenco): solo il cuore, il testo resta per i lettori di schermo.
function creaBottonePreferito(punto, compatto = false) {
    const attivo = ePreferito(punto.id);
    const testo = compatto
        ? `<span class="solo-lettori">Preferito: ${escapeHtml(punto.nome)}</span>`
        : `Preferito<span class="solo-lettori">: ${escapeHtml(punto.nome)}</span>`;
    return `
        <button type="button" class="preferito${compatto ? " preferito--compatto" : ""}" data-id="${escapeHtml(punto.id)}" aria-pressed="${attivo}">
            <span class="preferito__icona" aria-hidden="true">${attivo ? "♥" : "♡"}</span>
            ${testo}
        </button>
    `;
}

// Aggiorna tutti i bottoni dello stesso punto (scheda e finestra dei dettagli)
function aggiornaBottoniPreferito(id, attivo) {
    document.querySelectorAll(`.preferito[data-id="${CSS.escape(id)}"]`).forEach(bottone => {
        bottone.setAttribute("aria-pressed", String(attivo));
        bottone.querySelector(".preferito__icona").textContent = attivo ? "♥" : "♡";
    });
}

// Un solo ascoltatore per contenitore (delega degli eventi): funziona per ogni
// scheda, anche se l'elenco o la finestra dei dettagli vengono ridisegnati.
// "alCambio" riapplica i filtri, utile quando è attivo "Solo i miei preferiti".
function gestisciPreferiti(contenitori, alCambio) {
    contenitori.filter(Boolean).forEach(contenitore => {
        contenitore.addEventListener("click", evento => {
            const bottone = evento.target.closest(".preferito");
            if (!bottone) {
                return;
            }
            aggiornaBottoniPreferito(bottone.dataset.id, cambiaPreferito(bottone.dataset.id));
            alCambio();

            // Se la scheda è sparita (filtro "solo preferiti"), il focus non va perso
            const punto = bottone.closest(".punto");
            const sezione = document.getElementById("risultati");
            if (punto && punto.hidden && sezione) {
                sezione.focus();
            }
        });
    });
}
