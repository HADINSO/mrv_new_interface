import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../assets/Loader";

interface Props {
  prompt: string;
}

const InformeLecturas: React.FC<Props> = ({ prompt }) => {
  const [respuestaIA, setRespuestaIA] = useState<string>("Generando informe...");
  const [displayedText, setDisplayedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const generarInforme = async () => {
      if (!prompt || prompt.trim() === "") {
        setRespuestaIA("No se proporcionó ningún texto para generar el informe.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("pregunta", prompt);

      try {
        const res = await axios.post("https://mrv-ia.onrender.com/preguntar", formData);
        if (res.data && res.data.respuesta) {
          setRespuestaIA(res.data.respuesta);
        } else {
          setRespuestaIA("No se obtuvo una respuesta válida del servidor.");
        }
      } catch (err) {
        console.error("Error al generar el informe:", err);
        setError("Ocurrió un error al generar el informe.");
        setRespuestaIA("");
      } finally {
        setLoading(false);
      }
    };

    generarInforme();
  }, [prompt]);

  // Efecto tipo escritura
  useEffect(() => {
    if (!loading && !error && respuestaIA) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(respuestaIA.slice(0, index + 1));
        index++;
        if (index === respuestaIA.length) clearInterval(interval);
      }, 15); // Velocidad de escritura
      return () => clearInterval(interval);
    }
  }, [respuestaIA, loading, error]);

  return (
    <div className="p-6 rounded-2xl border shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 text-sm rounded-md">
          Informe IA
        </span>
        Generado automáticamente
      </h2>
      {loading ? (
        <div className="text-gray-600 dark:text-gray-400 animate-pulse">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-400 font-medium">
          ⚠️ {error}
        </div>
      ) : (
        <div className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {displayedText}
        </div>
      )}
    </div>
  );
};

export default InformeLecturas;
