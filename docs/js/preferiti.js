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
function creaBottonePreferito(punto) {
    const attivo = ePreferito(punto.id);
    return `
        <button type="button" class="preferito" data-id="${escapeHtml(punto.id)}" aria-pressed="${attivo}">
            <span class="preferito__icona" aria-hidden="true">${attivo ? "♥" : "♡"}</span>
            Preferito<span class="solo-lettori">: ${escapeHtml(punto.nome)}</span>
        </button>
    `;
}

function aggiornaBottonePreferito(bottone, attivo) {
    bottone.setAttribute("aria-pressed", String(attivo));
    bottone.querySelector(".preferito__icona").textContent = attivo ? "♥" : "♡";
}

// Un solo ascoltatore su tutto l'elenco (delega degli eventi):
// funziona per ogni scheda, anche se l'elenco viene ridisegnato.
// "alCambio" riapplica i filtri, utile quando è attivo "Solo i miei preferiti".
function gestisciPreferiti(elenco, alCambio) {
    elenco.addEventListener("click", evento => {
        const bottone = evento.target.closest(".preferito");
        if (!bottone) {
            return;
        }
        aggiornaBottonePreferito(bottone, cambiaPreferito(bottone.dataset.id));
        alCambio();

        // Se la scheda è sparita (filtro "solo preferiti"), il focus non va perso
        const sezione = elenco.closest(".risultati");
        if (bottone.closest(".punto").hidden && sezione) {
            sezione.focus();
        }
    });
}
