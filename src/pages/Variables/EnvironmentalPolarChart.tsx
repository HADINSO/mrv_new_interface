import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";
import { WiBarometer } from "react-icons/wi";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

interface VariableAmbiental {
  id: number;
  lectura: string;
  hora: string;
  fecha: string;
}

interface EnvironmentalPolarChartProps {
  data: VariableAmbiental[];
  code: string;
}

const EnvironmentalPolarChart: React.FC<EnvironmentalPolarChartProps> = ({
  data,
  code,
}) => {
  const formatearLectura = (lectura: string, codigo: string): number | null => {
    const regex = new RegExp(`(\\d+(\\.\\d+)?)(?=${codigo})`);
    const match = lectura.match(regex);
    const valorStr = match ? match[1] : null;
    if (!valorStr) return null;
    const num = parseFloat(valorStr);
    if (isNaN(num)) return null;

    switch (codigo) {
      case "V5":
        return parseFloat(num.toFixed(1));
      case "V8":
        return Math.round(num);
      case "V9":
        return valorStr.length > 5
          ? num / 100000
          : parseFloat(`0.${valorStr.padStart(5, "0")}`);
      case "V3":
      case "V4":
      case "V6":
      case "V7":
        return parseFloat(num.toFixed(1));
      case "V2":
      case "V1":
        return parseFloat(num.toFixed(2));
      case "V10":
        return parseFloat(num.toFixed(1));
      case "V13":
      case "V12":
      case "V15":
      case "V16":
        return parseFloat(num.toFixed(3));
      default:
        return num;
    }
  };

  const getUnidad = (codigo: string): string => {
    switch (codigo) {
      case "V5":
        return "°C";
      case "V8":
        return "%";
      case "V9":
        return "bar";
      case "V3":
      case "V4":
        return "km/h";
      case "V6":
      case "V7":
        return "mm";
      case "V2":
      case "V1":
        return "m";
      case "V10":
        return "W/m²";
      case "V13":
      case "V12":
      case "V15":
      case "V16":
        return "µg/m³";
      default:
        return "";
    }
  };

  const valores = data
    .map((item) => formatearLectura(item.lectura, code))
    .filter((v) => v !== null) as number[];

  const horas = data.map((item) => item.hora);
  const unidad = getUnidad(code);

  // Colores dinámicos: rojo si sube, verde si baja o igual
  const colores = valores.map((v, i) => {
    if (i === 0) return "#3b82f6cc"; // azul inicial
    return v > valores[i - 1] ? "#ef4444cc" : "#22c55ecc";
  });

  // Mostrar todos los valores por defecto
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  useEffect(() => {
    // Al cargar, activa todos los índices por defecto
    setActiveIndexes(Array.from({ length: valores.length }, (_, i) => i));
  }, [valores.length]);

  const toggleIndex = (index: number) => {
    setActiveIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  const filteredValues = valores.filter((_, i) => activeIndexes.includes(i));
  const filteredHoras = horas.filter((_, i) => activeIndexes.includes(i));
  const filteredColors = colores.filter((_, i) => activeIndexes.includes(i));

  const chartData: ChartData<"polarArea"> = {
    labels: filteredHoras,
    datasets: [
      {
        label: `Lecturas (${unidad})`,
        data: filteredValues,
        backgroundColor: filteredColors,
        borderColor: "#1e3a8a",
        borderWidth: 1,
      },
    ],
  };

  // Detectar si el modo oscuro está activo
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark");
    setIsDarkMode(dark);

    const observer = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains("dark");
      setIsDarkMode(darkNow);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const options: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} ${unidad}`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? "#d1d5db" : "#4b5563", // gris claro en modo oscuro
        },
        grid: {
          color: isDarkMode ? "#374151" : "#e5e7eb", // líneas adaptadas
        },
        angleLines: {
          color: isDarkMode ? "#4b5563" : "#d1d5db",
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 w-full max-w-5xl mx-auto hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full">
          <WiBarometer className="text-blue-500 dark:text-blue-300 text-3xl" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          Gráfico de Variable Ambiental (Polar)
        </h2>
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Gráfico */}
        <div className="w-full md:w-3/5 h-[400px] flex items-center justify-center">
          <PolarArea data={chartData} options={options} />
        </div>

        {/* Leyenda interactiva */}
        <div className="w-full md:w-2/5 flex flex-col justify-start gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
            Detalles de las Lecturas
          </h3>
          <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
            {horas.map((hora, index) => {
              const activo = activeIndexes.includes(index);
              const color =
                index === 0
                  ? "#3b82f6"
                  : valores[index] > valores[index - 1]
                  ? "#ef4444"
                  : "#22c55e";
              return (
                <li
                  key={index}
                  onClick={() => toggleIndex(index)}
                  className={`flex justify-between items-center rounded-lg shadow-sm px-3 py-2 cursor-pointer transition-all ${
                    activo
                      ? "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800"
                      : "bg-gray-200 dark:bg-gray-700 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {hora}
                    </span>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: color }}
                  >
                    {valores[index]} {unidad}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalPolarChart;
