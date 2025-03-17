const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let estudos = [];

app.post("/iniciar", (req, res) => {
  const { assunto, tempo } = req.body;
  estudos.push({ assunto, tempo, status: "Em andamento" });
  res.json({ mensagem: "Estudo iniciado!" });
});

app.listen(5000, () => console.log("Servidor rodando na porta 5000"));
