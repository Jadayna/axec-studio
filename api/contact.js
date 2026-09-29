// Vercel serverless function — envoi direct du formulaire de contact via Resend.
// Requiert la variable d'environnement RESEND_API_KEY sur le projet Vercel.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  var key = process.env.RESEND_API_KEY;
  if (!key) {
    res.status(500).json({ error: "not_configured" });
    return;
  }

  var body = req.body || {};
  var name = String(body.name || "").slice(0, 120).trim();
  var email = String(body.email || "").slice(0, 160).trim();
  var message = String(body.message || "").slice(0, 5000).trim();
  var lang = body.lang === "en" ? "en" : "fr";

  if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }

  var subject = (lang === "en" ? "Free evaluation — " : "Évaluation gratuite — ") + name;
  var text =
    (lang === "en" ? "New message from axecstudio.com" : "Nouveau message de axecstudio.com") +
    "\n\nNom / Name : " + name +
    "\nCourriel / Email : " + email +
    "\n\n" + message;

  try {
    var r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Axe C Studio <noreply@mysolaia.ca>",
        to: ["jkayna.mercier@gmail.com"],
        reply_to: email,
        subject: subject,
        text: text
      })
    });
    if (!r.ok) {
      var t = "";
      try { t = await r.text(); } catch (e) {}
      console.error("resend_error", r.status, t);
      res.status(502).json({ error: "send_failed" });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "send_failed" });
  }
};
