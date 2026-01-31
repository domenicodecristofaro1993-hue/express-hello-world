const express = require("express");
const fetch = require("node-fetch"); // Usa node-fetch@2
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// ===============================
// 🌍 HOME PAGE (HTML semplice)
// ===============================
app.get("/", (req, res) => {
  res.type("html").send(html);
});

// ===============================
// ✈️ API MULTI-CITY DINAMICA
// ===============================
app.post("/api/multicity", async (req, res) => {
  try {
    const {
      market = "US",
      locale = "en-US",
      currency = "USD",
      adults = 1,
      children = 0,
      infants = 0,
      cabinClass = "economy",
      stops = [],
      sort = "",
      carriersIds = [],
      flights = []
    } = req.body;

    if (!flights.length) {
      return res.status(400).json({ error: "Devi fornire almeno un volo" });
    }

    const url = "https://fly-scraper.p.rapidapi.com/v2/flights/search-multi-city";

    const body = {
      market,
      locale,
      currency,
      adults,
      children,
      infants,
      cabinClass,
      stops,
      sort,
      carriersIds,
      flights
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "fly-scraper.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Errore RapidAPI:", err);
    res.status(500).json({ error: "Errore nella chiamata multi-city" });
  }
});

// ===============================
// 🚀 AVVIO SERVER
// ===============================
const server = app.listen(port, () => {
  console.log(`Server online su porta ${port}`);
});

// Timeout richiesti da Render
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// ===============================
// 🌐 HTML FRONTEND MINIMALE
// ===============================
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Multi-City Flight Search</title>
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
      input, button, textarea {
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
      <h2>Ricerca Voli Multi-City</h2>

      <textarea id="jsonInput" rows="10">
{
  "market": "US",
  "locale": "en-US",
  "currency": "USD",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "economy",
  "stops": [],
  "sort": "",
  "carriersIds": [-32677, -32695],
  "flights": [
    { "originSkyId": "MSYA", "destinationSkyId": "LOND", "departDate": "2026-06-13" },
    { "originSkyId": "PARI", "destinationSkyId": "HAN", "departDate": "2026-06-29" }
  ]
}
      </textarea>

      <button onclick="search()">Cerca</button>
      <pre id="results"></pre>

      <script>
        async function search() {
          const body = JSON.parse(document.getElementById("jsonInput").value);

          const res = await fetch("/api/multicity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
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
