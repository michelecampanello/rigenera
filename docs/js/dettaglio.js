// ==========================================================================
// Finestra con i dettagli di un punto (index.html)
// Usa: schede.js (creaInfo, creaEtichette...), preferiti.js.
// ==========================================================================

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
