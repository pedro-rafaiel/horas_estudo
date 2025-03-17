import React, { useState, useEffect } from "react";
import { Howl } from "howler";
import { FaBook, FaClock, FaBell, FaHistory, FaStop } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css";

const alarmeSom = new Howl({
  src: ["/alarme.mp3"],
  volume: 1,
});

function App() {
  const [tempo, setTempo] = useState(0);
  const [assunto, setAssunto] = useState("");
  const [contando, setContando] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [totalEstudo, setTotalEstudo] = useState(
    Number(localStorage.getItem("totalEstudo")) || 0
  );
  const [estudos, setEstudos] = useState(
    JSON.parse(localStorage.getItem("estudos")) || []
  );
  const [mostrarPopup, setMostrarPopup] = useState(false);

  useEffect(() => {
    let intervalo;
    if (contando && tempoRestante > 0) {
      intervalo = setInterval(() => {
        setTempoRestante((t) => t - 1);
      }, 1000);
    } else if (tempoRestante === 0 && contando) {
      alarmeSom.play();
      setContando(false);

      setTimeout(() => {
        const continuar = window.confirm("⏳ Deseja continuar estudando?");
        if (continuar) {
          alarmeSom.stop();
          const tempoEstudado = tempo * 60;
          const novoTotal = totalEstudo + tempoEstudado / 60;
          setTotalEstudo(novoTotal);
          localStorage.setItem("totalEstudo", novoTotal);

          const novoEstudo = {
            nome: assunto || "Sem nome",
            hora: new Date().toLocaleTimeString(),
            tempo: tempo,
          };

          const novosEstudos = [...estudos, novoEstudo];
          setEstudos(novosEstudos);
          localStorage.setItem("estudos", JSON.stringify(novosEstudos));

          return;
        }

        alarmeSom.stop();
        setMostrarPopup(true);
      }, 500);
    }

    return () => clearInterval(intervalo);
  }, [contando, tempoRestante, totalEstudo, estudos]);

  const iniciarEstudo = () => {
    if (tempo > 0) {
      setTempoRestante(tempo * 60);
      setContando(true);
    }
  };

  const finalizarEstudos = () => {
    if (contando) return; 
    setMostrarPopup(true);
  };

  const fecharPopup = () => {
    setMostrarPopup(false);
    setTotalEstudo(0); 
    setEstudos([]);
    localStorage.removeItem("totalEstudo");
    localStorage.removeItem("estudos");
  };

  const getMensagemMotivacional = () => {
    if (totalEstudo < 60) {
      return "⚠️ Você estudou menos de 1 hora hoje. Recomendo estudar um pouco mais!";
    } else if (totalEstudo >= 60 && totalEstudo < 240) {
      return "🎉 Parabéns! Continue assim que vai dar tudo certo!";
    } else {
      return "🚀 Muitos parabéns! Você está incrível!";
    }
  };

  return (
    <div className="container">
      <FaBook className="icon" />
      <h1>Horas de Estudo 📚</h1>

      <input
        type="text"
        placeholder="O que você vai estudar?"
        value={assunto}
        onChange={(e) => setAssunto(e.target.value)}
      />

      <input
        type="number"
        placeholder="Tempo em minutos"
        value={tempo}
        onChange={(e) => setTempo(Number(e.target.value))}
      />

      <button onClick={iniciarEstudo} disabled={contando}>
        <FaClock /> Iniciar Estudo
      </button>

      <h2 className="timer">
        {contando ? "Estudando" : "Parado"}:{" "}
        {Math.floor(tempoRestante / 60)}:
        {("0" + (tempoRestante % 60)).slice(-2)}
      </h2>

      <h3 className="total-estudo">
        <FaHistory /> Tempo total de estudo: {totalEstudo} minutos
      </h3>

      {tempoRestante === 0 && (
        <button className="alarme-btn" onClick={() => alarmeSom.stop()}>
          <FaBell /> Parar Alarme
        </button>
      )}

      <button className="reset-btn" onClick={fecharPopup}>
        🔄 Resetar Tempo
      </button>

      {!contando && totalEstudo > 0 && (
        <button className="finalizar-btn" onClick={finalizarEstudos}>
          <FaStop /> Finalizar Estudos
        </button>
      )}

      {mostrarPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>📊 Resumo do Estudo de Hoje</h2>
            <Bar
              data={{
                labels: estudos.map((estudo) => estudo.hora),
                datasets: [
                  {
                    label: "Tempo Estudado (minutos)",
                    data: estudos.map((estudo) => estudo.tempo),
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
            <p>{getMensagemMotivacional()}</p>
            <button onClick={fecharPopup}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
