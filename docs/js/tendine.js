// ==========================================================================
// Menu a tendina dei filtri (index.html)
// Ogni menu è un bottone che apre una "tendina" con le pillole del gruppo.
// Le pillole sono radio veri dentro un fieldset: il menu non cambia il modo
// di scegliere, cambia solo dove stanno le scelte.
// - clic sul bottone: apre o chiude (aria-expanded dice se è aperta);
//   aprendone una, le altre si chiudono
// - clic su una pillola: sceglie e chiude
// - tastiera: Tab entra nella tendina, le frecce cambiano scelta (resta
//   aperta, così si possono provare le voci), Esc chiude e torna al bottone
// - clic o focus fuori dal menu: chiude
// ==========================================================================

function apriTendina(menu, aperta) {
    const bottone = menu.querySelector(".menu-filtro__bottone");
    const tendina = menu.querySelector(".tendina");
    bottone.setAttribute("aria-expanded", String(aperta));
    tendina.hidden = !aperta;
    if (!aperta) {
        return;
    }
    // Se la tendina uscirebbe dallo schermo a destra, si sposta a sinistra
    // quanto basta, senza superare il margine sinistro (16px per lato)
    const margine = 16;
    tendina.style.left = "";
    const riquadro = tendina.getBoundingClientRect();
    const larghezzaSchermo = document.documentElement.clientWidth;
    const sporge = riquadro.right - (larghezzaSchermo - margine);
    if (sporge > 0) {
        const spostamento = Math.min(sporge, riquadro.left - margine);
        tendina.style.left = `${-spostamento}px`;
    }
}

function chiudiTendine(filtri, tranne) {
    filtri.querySelectorAll(".menu-filtro").forEach(menu => {
        if (menu !== tranne) {
            apriTendina(menu, false);
        }
    });
}

function gestisciTendine(filtri) {
    filtri.querySelectorAll(".menu-filtro").forEach(menu => {
        const bottone = menu.querySelector(".menu-filtro__bottone");
        const tendina = menu.querySelector(".tendina");
        if (!bottone || !tendina) {
            return;
        }

        bottone.addEventListener("click", () => {
            const aperta = bottone.getAttribute("aria-expanded") === "true";
            chiudiTendine(filtri, menu);
            apriTendina(menu, !aperta);
        });

        // Clic con mouse o dito su una pillola: scelta fatta, la tendina si chiude.
        // Con la tastiera (frecce, spazio) il clic arriva con detail 0: resta aperta.
        tendina.addEventListener("click", evento => {
            if (evento.target.matches("input") && evento.detail > 0) {
                apriTendina(menu, false);
                bottone.focus();
            }
        });

        menu.addEventListener("keydown", evento => {
            if (evento.key === "Escape" && !tendina.hidden) {
                evento.preventDefault();
                apriTendina(menu, false);
                bottone.focus();
            }
        });

        // Il focus esce dal menu (Tab oltre l'ultima pillola): si chiude
        menu.addEventListener("focusout", evento => {
            if (evento.relatedTarget && !menu.contains(evento.relatedTarget)) {
                apriTendina(menu, false);
            }
        });
    });

    // Clic in un punto qualsiasi fuori dai menu: si chiudono tutti
    document.addEventListener("click", evento => {
        if (!evento.target.closest(".menu-filtro")) {
            chiudiTendine(filtri);
        }
    });
}
