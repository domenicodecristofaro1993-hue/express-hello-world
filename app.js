const express = require("express");
const https = require("https");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// ===============================
// HOME PAGE
// ===============================
app.get("/", (req, res) => {
  res.type("html").send(html);
});

// ===============================
// API: PRICE CALENDAR (GET RapidAPI)
// ===============================
app.post("/api/price-calendar", (req, res) => {
  const { fromEntityId, toEntityId, departDate } = req.body;

  if (!fromEntityId || !toEntityId || !departDate) {
    return res.status(400).json({ error: "Parametri mancanti" });
  }

  const options = {
    method: "GET",
    hostname: "flights-sky.p.rapidapi.com",
    port: null,
    path: `/flights/price-calendar?fromEntityId=${fromEntityId}&departDate=${departDate}&toEntityId=${toEntityId}`,
    headers: {
      "x-rapidapi-key": b4c45da22dmshb1f7682b10a9655p17628bjsn676920364e64,
      "x-rapidapi-host": "flights-sky.p.rapidapi.com"
    }
  };

  const request = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks).toString();
      try {
        res.json(JSON.parse(body));
      } catch (err) {
        res.status(500).json({ error: "Errore parsing risposta RapidAPI" });
      }
    });
  });

  request.on("error", (err) => {
    console.error("Errore HTTPS:", err);
    res.status(500).json({ error: "Errore nella richiesta HTTPS" });
  });

  request.end();
});

// ===============================
// AVVIO SERVER
// ===============================
const server = app.listen(port, () => {
  console.log(`Server online su porta ${port}`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// ===============================
// FRONTEND MINIMALE
// ===============================
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Price Calendar Search</title>
    <style>
      body { font-family: Arial; background: #f5f5f5; }
      section {
        padding: 2em;
        background: white;
        border-radius: 10px;
        width: 450px;
        margin: 100px auto;
        text-align: center;
      }
      input, button {
        padding: 10px;
        margin: 5px;
        width: 90%;
        border-radius: 6px;
        border: 1px solid #ccc;
      }
      button {
        background: #3b82f6;
        color: white;
        cursor: pointer;
      }
      button:hover {
        background: #2563eb;
      }
      pre {
        text-align: left;
        background: #eee;
        padding: 10px;
        border-radius: 6px;
        max-height: 300px;
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <section>
      <h2>Ricerca Price Calendar</h2>

      <input id="from" placeholder="fromEntityId (es. CDG)" />
      <input id="to" placeholder="toEntityId (es. JFK)" />
      <input id="date" type="date" />

      <button onclick="search()">Cerca</button>

      <pre id="results"></pre>

      <script>
        async function search() {
          const fromEntityId = document.getElementById("from").value;
          const toEntityId = document.getElementById("to").value;
          const departDate = document.getElementById("date").value;

          const res = await fetch("/api/price-calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fromEntityId, toEntityId, departDate })
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
