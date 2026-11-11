# Guida al riuso – Fondazione Rigenera

Sito statico in **solo HTML e CSS**. Nessun JavaScript, nessun back end, nessun database.

```
index.html    → la guida: filtri + elenco dei punti
segnala.html  → modulo con cui i cittadini segnalano nuovi punti
style.css     → tutto lo stile, compresa la logica dei filtri
```

Per pubblicarlo basta caricare i tre file su un qualsiasi hosting statico (GitHub Pages, Netlify, l'hosting già in uso dalla Fondazione). Si apre anche con un doppio clic su `index.html`.

---

## Dalle richieste di Giulia alle scelte tecniche

### 1. "Per tutti i cittadini, leggibile dal telefono, accessibile"

| Scelta | Perché |
|---|---|
| **Mobile first**, un'unica colonna sul telefono, filtri laterali fissi solo da 62rem in su | La maggior parte delle persone arriverà dal telefono, magari per strada. |
| **Testo base a 18px**, misure in `rem`, titoli con `clamp()` | Più leggibile dello standard di 16px; i `rem` rispettano lo zoom e la dimensione del testo impostata dall'utente. |
| **Contrasti ≥ 7:1** per il testo (livello AAA) e ≥ 3:1 per i bordi dei controlli | Pensato per chi ha difficoltà visive o usa il telefono sotto il sole. |
| **Aree di tocco di almeno 44px** su pillole, link del menu, bottoni e caselle | Utili per chi ha poca precisione nelle mani o usa il telefono con una mano sola. |
| **HTML semantico**: `header`, `nav`, `main`, `footer`, `article`, `fieldset`/`legend`, liste vere, `dl` per zona/indirizzo/orari | I lettori di schermo annunciano correttamente struttura, gruppi di filtri e numero di schede. |
| **Navigazione da tastiera**: link "Vai direttamente ai punti", focus arancione sempre visibile, filtri fatti di veri `radio` (Tab tra i gruppi, frecce dentro il gruppo) | Chi usa la tastiera non deve mai "perdersi". |
| **Il colore non è mai l'unica informazione**: la scelta attiva ha anche il segno ✓, le etichette delle azioni hanno testo esplicito | Utile per chi non distingue i colori. |
| `prefers-reduced-motion`, `forced-colors` (contrasto elevato di Windows), stile di **stampa** | Rispetta le preferenze di sistema; molte persone anziane preferiscono stampare l'elenco. |
| Linguaggio semplice: "Cosa vuoi fare", "Che oggetto hai", "In che zona" | Sono le domande che la persona si fa già, nell'ordine in cui se le fa. |

### 2. "Trovare il punto giusto in pochi secondi"

Tre gruppi di filtri che corrispondono al bisogno reale: **azione → oggetto → zona**. "Dove riparo la bici?" si risolve con due tocchi.

**Come funziona senza JavaScript.** Ogni filtro è un pulsante radio. In `style.css`, il selettore `:has()` controlla quale scelta è attiva e nasconde le schede il cui attributo `data-` non contiene quel valore:

```css
.guida:has(#az-ripara:checked) .punto:not([data-azione~="ripara"]) { display: none; }
```

- I tre gruppi si combinano da soli: resta visibile solo ciò che supera tutti i filtri.
- Un punto può avere **più azioni o categorie** (`data-azione="ripara dona"`), grazie all'operatore `~=`.
- **"Azzera i filtri"** è un `<button type="reset">` nativo: riporta tutto su "Tutto" senza codice.
- Il **numero di risultati** è calcolato da un contatore CSS (`counter()`): gli elementi nascosti non vengono contati.
- **Degradazione elegante**: un browser molto vecchio che non supporta `:has()` (supportato da tutti i browser principali dalla fine del 2023) mostra semplicemente tutti i punti. La guida resta comunque utilizzabile.

### 3. "Aggiornare l'elenco non deve diventare un incubo"

Con il vincolo "solo HTML e CSS" i punti stanno in `index.html`, ma organizzati in modo che **aggiungere un punto voglia dire toccare un solo blocco in un solo file**:

1. In `index.html` c'è un **modello commentato** con le istruzioni passo passo.
2. Si copia un blocco `<li class="punto">…</li>`, si cambiano i testi e i tre attributi `data-azione`, `data-categoria` e `data-zona`.
3. **Non si tocca il CSS**: i filtri leggono gli attributi e funzionano da soli.

Il CSS va modificato solo per aggiungere una **nuova categoria o zona**: una pillola in HTML e una riga in CSS, come spiegato nei commenti.

### 4. "I cittadini possono segnalarci nuovi punti"

`segnala.html` contiene un modulo HTML con gli stessi campi di una scheda (nome, azioni, categorie, zona, indirizzo, orari, descrizione), più un contatto facoltativo e il consenso privacy.

- **Senza back end** il modulo invia i dati a un servizio per moduli statici (Formspree, Netlify Forms, Tally…), che li inoltra via e-mail alla Fondazione. **Da fare:** sostituire `ID-DA-INSERIRE` nell'attributo `action` con l'indirizzo fornito dal servizio scelto.
- Validazione nativa del browser (`required`, `type="email"`, `type="url"`, `maxlength`). Gli errori vengono evidenziati con `:user-invalid`, quindi solo dopo che l'utente ha toccato il campo e non appena si apre la pagina.
- `autocomplete` e `inputmode` sui campi, per compilare più in fretta dal telefono.
- Un **campo-trappola anti-spam** (honeypot), invisibile alle persone.
- Le segnalazioni **non vengono pubblicate in automatico**: la Fondazione le verifica prima di inserirle. In questo modo la guida resta affidabile.

---

## Limiti noti (con il vincolo "solo HTML e CSS")

- **Annuncio dei risultati**: il conteggio si aggiorna a schermo, ma un lettore di schermo non lo annuncia automaticamente quando cambia un filtro (servirebbe una riga di JavaScript con `aria-live`). Le schede nascoste però spariscono anche per il lettore di schermo, che legge solo i risultati pertinenti.
- **Messaggio "nessun risultato"**: per le combinazioni di filtri non si può mostrare in solo CSS. Il contatore mostra comunque "0" accanto all'invito a togliere un filtro o a segnalare un punto.
- **Checkbox "Cosa si può fare?"**: l'HTML non permette di rendere obbligatoria "almeno una" casella di un gruppo, per questo il campo è facoltativo.
- **Molti punti**: sopra il centinaio di schede, mantenerle a mano in un unico HTML diventa scomodo.

## Proposta per la fase 2 (quando i punti cresceranno)

Il markup e il CSS di questa versione restano validi: cambia solo **dove vivono i dati**.

1. **Dati in un file separato** (`punti.json` o un foglio Google), da cui un generatore di siti statici (es. **Eleventy**) crea l'HTML in automatico a ogni modifica. Il CSS dei filtri resta identico.
2. **Pannello di modifica senza codice** con un CMS headless gratuito (es. **Decap CMS**): Giulia aggiunge e modifica i punti da un modulo web, senza mai aprire un file HTML.
3. **Un tocco di JavaScript progressivo** per annunciare i risultati ai lettori di schermo, mostrare il messaggio "nessun risultato", aggiungere una ricerca testuale libera e, più avanti, una mappa.
4. Le segnalazioni del modulo possono arrivare direttamente come bozze nel CMS, invece che per e-mail.

> Nota: i punti presenti nella guida sono **dati di esempio** inventati, da sostituire con quelli reali della Fondazione.
