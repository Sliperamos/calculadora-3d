(function () {
  var APP = "https://sliperamos.github.io/calculadora-3d/";
  var found = null;

  function num(v) {
    if (typeof v === "number") return v;
    if (typeof v === "string" && /^\d+(\.\d+)?$/.test(v)) return parseFloat(v);
    return NaN;
  }
  function pick(o, keys) {
    for (var i = 0; i < keys.length; i++) if (o[keys[i]] != null) return num(o[keys[i]]);
    return NaN;
  }
  /* Procura nos dados da página um objeto com tempo (segundos) e peso (gramas) juntos */
  function walk(o, d) {
    if (found || !o || typeof o !== "object" || d > 16) return;
    if (Array.isArray(o)) { for (var i = 0; i < o.length && !found; i++) walk(o[i], d + 1); return; }
    var s = pick(o, ["prediction", "printTime", "print_time", "estimatedPrintTime", "printDuration"]);
    var g = pick(o, ["weight", "filamentWeight", "filament_weight", "filamentUsedG", "weightG"]);
    if (s > 0 && g > 0) { found = { min: s / 60, g: g }; return; }
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) walk(o[k], d + 1);
  }
  var scripts = document.querySelectorAll('script#__NEXT_DATA__, script[type="application/json"], script[type="application/ld+json"]');
  for (var i = 0; i < scripts.length && !found; i++) {
    try { walk(JSON.parse(scripts[i].textContent), 0); } catch (e) {}
  }

  /* Texto: o trecho selecionado tem prioridade; senão, as linhas da página com números de tempo ou peso */
  var txt = String(window.getSelection ? window.getSelection() : "").trim();
  if (!txt) {
    var lines = (document.body.innerText || "").split(/\n+/);
    var re = /\d\s*(g|kg|gramas?|grams?)\b|\d\s*h(oras?|ours?|rs?)?\b|\d\s*min|\b\d{1,2}:\d{2}\b/i;
    var key = /filament|filamento|peso|weight|tempo|print time|impress|duration/i;
    var top = [], rest = [];
    for (var j = 0; j < lines.length; j++) {
      var l = lines[j].trim(), prev = (lines[j - 1] || "").trim();
      if (!l || l.length > 120 || !re.test(l)) continue;
      var item = (key.test(prev) && !key.test(l) && prev.length < 60 ? prev + " " : "") + l;
      (key.test(item) ? top : rest).push(item);
    }
    txt = top.concat(rest).slice(0, 15).join(" | ");
  }

  var meta = document.querySelector('meta[property="og:title"]');
  var name = ((meta && meta.content) || document.title || "").split(/\s[|\-–—]\s/)[0].trim();

  var q = "n=" + encodeURIComponent(name.slice(0, 80)) + "&src=" + encodeURIComponent(location.hostname);
  if (found) q += "&g=" + Math.round(found.g * 10) / 10 + "&min=" + Math.round(found.min);
  else if (txt) q += "&txt=" + encodeURIComponent(txt.slice(0, 1500));
  var url = APP + "?" + q;

  if (typeof completion === "function") completion(url);
  else location.href = url;
})();
