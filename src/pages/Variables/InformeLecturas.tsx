import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../assets/Loader";
import { motion } from "framer-motion";
import { MessageSquareText, Sparkles } from "lucide-react";

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

  // Efecto de escritura suave
  useEffect(() => {
    if (!loading && !error && respuestaIA) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(respuestaIA.slice(0, index + 1));
        index++;
        if (index === respuestaIA.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    }
  }, [respuestaIA, loading, error]);

  return (
    <div className="relative p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40">
            <MessageSquareText className="w-6 h-6 text-blue-700 dark:text-blue-300" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Informe Inteligente
          </h2>
        </div>

        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:flex items-center gap-1 text-blue-600 dark:text-blue-300"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">IA Activa</span>
        </motion.div>
      </div>

      <div className="relative bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl p-5 md:p-6 border border-gray-100 dark:border-gray-700 min-h-[180px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600 dark:text-gray-400">
            <Loader />
            <span className="mt-3 animate-pulse">Generando informe...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
            ⚠️ {error}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-[15px]"
          >
            {displayedText}
          </motion.div>
        )}
      </div>

      <div className="absolute top-2 right-3 text-xs text-gray-400 dark:text-gray-500 italic">
        Generado por IA
      </div>
    </div>
  );
};

export default InformeLecturas;
