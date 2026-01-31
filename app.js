import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());



// Serve la homepage
app.get("/", (req, res) => res.type("html").send(html));

// ===============================
// ✈️ API: Ricerca voli Skyscanner
// ===============================
app.post("/api/search", async (req, res) => {
  const { from, to, date } = req.body;

  if (!from || !to || !date) {
    return res.status(400).json({ error: "Parametri mancanti" });
  }

  try {
    const url = `https://skyscanner44.p.rapidapi.com/search?adults=1&origin=${from}&destination=${to}&departureDate=${date}`;

    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com"
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Errore API:", err);
    res.status(500).json({ error: "Errore nella ricerca voli" });
  }
});

// ===============================
// 🚀 Avvio server
// ===============================
const server = app.listen(port, () =>
  console.log(`Server online su porta ${port}`)
);

// Timeout richiesti da Render
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// ===============================
// 🌐 HTML iniziale
// ===============================
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Flight Search</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      body { font-family: Arial; background: #f5f5f5; }
      section {
        padding: 2em;
        background: white;
        border-radius: 10px;
        width: 400px;
        margin: 100px auto;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <section>
      <h2>Ricerca Voli</h2>
      <input id="from" placeholder="Da (es. MXP)" /><br><br>
      <input id="to" placeholder="A (es. JFK)" /><br><br>
      <input id="date" type="date" /><br><br>
      <button onclick="search()">Cerca</button>
      <pre id="results"></pre>

      <script>
        async function search() {
          const from = document.getElementById("from").value;
          const to = document.getElementById("to").value;
          const date = document.getElementById("date").value;

          const res = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from, to, date })
          });

          const data = await res.json();
          document.getElementById("results").innerText = JSON.stringify(data, null, 2);
        }
      </script>
    </section>
  </body>
</html>
`;

module.exports = app;
