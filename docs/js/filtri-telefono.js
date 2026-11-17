// ==========================================================================
// Filtri compatti sui telefoni (index.html)
// Sugli schermi piccoli i gruppi di filtri stanno in un pannello che si apre
// con il bottone "Filtri" accanto alla ricerca. Sopra l'elenco restano solo
// le pillole dei filtri attivi, che si tolgono con un tocco.
// Senza JavaScript il pannello resta sempre aperto.
// Usa: comune.js (GRUPPI_FILTRI, TUTTI, escapeHtml).
// ==========================================================================

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
