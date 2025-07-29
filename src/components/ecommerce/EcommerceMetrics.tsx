import { FaTemperatureHigh, FaWater } from "react-icons/fa";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import ApiHelsy from "../../service/ApiHelsy";

type Props = {
  estacion: number;
};

export default function EnvironmentalMetrics({ estacion }: Props) {
  const variables = {
    temperatura: "V5",
    humedad: "V8",
  };

  const [temperaturaData, setTemperaturaData] = useState<number | null>(null);
  const [temperaturaDiff, setTemperaturaDiff] = useState<number | null>(null);

  const [humedadData, setHumedadData] = useState<number | null>(null);
  const [humedadDiff, setHumedadDiff] = useState<number | null>(null);

  useEffect(() => {
    const fetchVar = async (variable: string, idEstacion: number) => {
      try {
        const response = await ApiHelsy.get(`previewDetailCharts/${idEstacion}/${variable}`);
        const data = response.data;

        if (Array.isArray(data) && data.length >= 2) {
          const parseLectura = (lectura: string) => {
            const match = lectura.match(/[\d\.]+/);
            return match ? parseFloat(match[0]) : null;
          };

          const ultima = parseLectura(data[data.length - 1].lectura);
          const anterior = parseLectura(data[data.length - 2].lectura);

          if (ultima !== null && anterior !== null) {
            const diferencia = parseFloat((ultima - anterior).toFixed(2));

            if (variable === "V5") {
              setTemperaturaData(ultima);
              setTemperaturaDiff(diferencia);
            } else if (variable === "V8") {
              setHumedadData(ultima);
              setHumedadDiff(diferencia);
            }
          }
        }
      } catch (error) {
        console.error(`Error al obtener datos para ${variable}:`, error);
      }
    };

    const loadData = () => {
      Object.values(variables).forEach((variable) => {
        fetchVar(variable, estacion);
      });
    };

    loadData(); // Carga inicial

    const interval = setInterval(loadData, 30000); // Cada 30 segundos

    return () => clearInterval(interval); // Limpieza
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
      {/* Temperatura */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900/30">
          <FaTemperatureHigh className="text-red-600 size-6 dark:text-red-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Temperatura actual
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {temperaturaData !== null ? `${temperaturaData}°C` : "Cargando..."}
            </h4>
          </div>
          {renderBadge(temperaturaDiff, "°C")}
        </div>
      </div>

      {/* Humedad */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
          <FaWater className="text-blue-600 size-6 dark:text-blue-300" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Humedad relativa
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {humedadData !== null ? `${humedadData}%` : "Cargando..."}
            </h4>
          </div>
          {renderBadge(humedadDiff, "%")}
        </div>
      </div>
    </div>
  );
}
