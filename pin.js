/* GREED Brain – PIN unico per tutte le pagine.
   Due PIN: Dario e Staff. Si mette una volta e vale tutto il giorno, su tutte le pagine
   di quel telefono/tablet/PC (fino a mezzanotte, o finché non si preme Esci).
   I PIN non sono scritti in chiaro: si confronta solo l'impronta SHA-256. */
(function () {
  var UTENTI = [
    { nome: 'DARIO', h: '3e06bef48e0fec1ab8d4cff9b193868caf301c98211f8aaf71ac1eb6ac9450fd', len: 6 },
    { nome: 'STAFF', h: '76e37a340bdd6471b01564ac117a94dad9d10d98904a8fcc04e786dbd2c71ded', len: 4 }
  ];
  var CHIAVE = 'greed_pin_sess';
  function oggi() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function impronta(pin) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode('greed-brain|' + pin)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    });
  }
  window.GreedPin = {
    utenti: UTENTI.map(function (u) { return u.nome; }),
    lunghezza: function (nome) { var u = UTENTI.find(function (x) { return x.nome === nome; }); return u ? u.len : 4; },
    // chi è già entrato oggi su questo dispositivo (oppure null)
    sessione: function () {
      try { var s = JSON.parse(localStorage.getItem(CHIAVE) || 'null'); if (s && s.giorno === oggi() && s.nome) return s.nome; } catch (e) {}
      return null;
    },
    ricorda: function (nome) { try { localStorage.setItem(CHIAVE, JSON.stringify({ nome: nome, giorno: oggi() })); } catch (e) {} },
    esci: function () { try { localStorage.removeItem(CHIAVE); } catch (e) {} },
    // PIN di un utente scelto: true/false
    verifica: function (nome, pin) {
      var u = UTENTI.find(function (x) { return x.nome === nome; }), self = this;
      if (!u) return Promise.resolve(false);
      return impronta(pin).then(function (h) { var ok = h === u.h; if (ok) self.ricorda(nome); return ok; });
    },
    // Chi deve mettere il PIN, in base all'account Google con cui si è entrati (DARIO, STAFF o null)
    ricordaAccount: function (email) { try { sessionStorage.setItem('greed_account', email || ''); } catch (e) {} },
    atteso: function () {
      var e = ''; try { e = sessionStorage.getItem('greed_account') || ''; } catch (x) {}
      return e === 'gelateriagreed@gmail.com' ? 'DARIO' : e === 'team.greedfrascati@gmail.com' ? 'STAFF' : null;
    },
    // Tastiera del PC: i numeri (anche il tastierino numerico) e il tasto ⌫ funzionano come i pulsanti,
    // solo mentre la schermata del PIN è visibile.
    tastiera: function (idSchermata, cifra, cancella) {
      document.addEventListener('keydown', function (e) {
        var el = document.getElementById(idSchermata);
        if (!el || getComputedStyle(el).display === 'none') return;
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (/^[0-9]$/.test(e.key)) { e.preventDefault(); cifra(e.key); }
        else if (e.key === 'Backspace') { e.preventDefault(); cancella(); }
      });
    },
    // PIN senza scegliere il nome: restituisce DARIO, STAFF oppure null
    prova: function (pin) {
      var self = this;
      return impronta(pin).then(function (h) {
        var u = UTENTI.find(function (x) { return x.h === h; });
        if (u) { self.ricorda(u.nome); return u.nome; }
        return null;
      });
    }
  };
})();
