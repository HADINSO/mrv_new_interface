import { FaWind } from "react-icons/fa";
import { WiBarometer } from "react-icons/wi";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import ApiHelsy from "../../service/ApiHelsy";

type Props = {
  estacion: number;
};

export default function EnvironmentalMetrics2({ estacion }: Props) {
  const variables = {
    monoxido: "V12",
    presion: "V9",
  };

  const [monoxidoData, setMonoxidoData] = useState<string | null>(null);
  // Eliminado monoxidoDiff porque no se usa

  const [presionData, setPresionData] = useState<string | null>(null);
  const [presionDiff, setPresionDiff] = useState<number | null>(null);

  useEffect(() => {
    const fetchVar = async (variable: string, idEstacion: number) => {
      try {
        const response = await ApiHelsy.get(`previewDetailCharts/${idEstacion}/${variable}`);
        const data = response.data;

        if (Array.isArray(data) && data.length >= 2) {
          const parseLectura = (lectura: string) => {
            const match = lectura.match(/[\d:\.]+/);
            return match ? match[0] : null;
          };

          const ultima = parseLectura(data[data.length - 1].lectura);
          const anterior = parseLectura(data[data.length - 2].lectura);

          if (ultima && anterior) {
            if (variable === "V12") {
              // Monóxido ya viene como string tipo 11:08
              setMonoxidoData(ultima);
              // Ya no seteamos monoxidoDiff
            } else if (variable === "V9") {
              // Presión barométrica: convertir a decimal
              const parsePresion = (val: string) => {
                if (val.startsWith("9")) {
                  return parseFloat(`0.${val}`);
                } else {
                  return parseFloat(val) / 10000;
                }
              };

              const presionFinal = parsePresion(ultima);
              const presionAnterior = parsePresion(anterior);
              const diferencia = parseFloat((presionFinal - presionAnterior).toFixed(4));

              setPresionData(presionFinal.toFixed(4));
              setPresionDiff(diferencia);
            }
          }
        }
      } catch (error) {
        console.error(`Error al obtener datos para ${variable}:`, error);
      }
    };

    const loadData = () => {
      for (const variable of Object.values(variables)) {
        fetchVar(variable, estacion);
      }
    };

    loadData();

    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, [estacion]);

  const renderBadge = (diff: number | null, unidad: string) => {
    if (diff === null) return null;

    const isUp = diff >= 0;
    const Icon = isUp ? AiOutlineArrowUp : AiOutlineArrowDown;
    const color = isUp ? "success" : "error";
    const signo = isUp ? "+" : "";

    return (
      <Badge color={color}>
        <Icon />
        {signo}
        {diff}
        {unidad}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Monóxido */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
          <FaWind className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Monóxido de carbono (μg/m³)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {monoxidoData ?? "Cargando..."}
            </h4>
          </div>
        </div>
      </div>

      {/* Presión Barométrica */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30">
          <WiBarometer className="text-purple-600 size-6 dark:text-purple-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Presión Barométrica (bar)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {presionData ?? "Cargando..."}
            </h4>
          </div>
          {renderBadge(presionDiff, "")}
        </div>
      </div>
    </div>
  );
}
