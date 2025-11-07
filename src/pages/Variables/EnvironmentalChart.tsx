import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { WiDaySunny } from "react-icons/wi";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface VariableAmbiental {
  id: number;
  lectura: string;
  hora: string;
  fecha: string;
}

interface EnvironmentalChartProps {
  data: VariableAmbiental[];
  code: string;
}

const EnvironmentalChart: React.FC<EnvironmentalChartProps> = ({ data, code }) => {
  const formatearLectura = (lectura: string, codigo: string): number | null => {
    const regex = new RegExp(`(\\d+(\\.\\d+)?)(?=${codigo})`);
    const match = lectura.match(regex);
    const valorStr = match ? match[1] : null;
    if (!valorStr) return null;
    const num = parseFloat(valorStr);
    if (isNaN(num)) return null;

    switch (codigo) {
      case "V5": return parseFloat(num.toFixed(1));
      case "V8": return Math.round(num);
      case "V9": return valorStr.length > 5
        ? num / 100000
        : parseFloat(`0.${valorStr.padStart(5, "0")}`);
      case "V3":
      case "V4":
      case "V6":
      case "V7": return parseFloat(num.toFixed(1));
      case "V2":
      case "V1": return parseFloat(num.toFixed(2));
      case "V10": return parseFloat(num.toFixed(1));
      case "V13":
      case "V12":
      case "V15":
      case "V16": return parseFloat(num.toFixed(3));
      default: return num;
    }
  };

  const getUnidad = (codigo: string): string => {
    switch (codigo) {
      case "V5": return "°C";
      case "V8": return "%";
      case "V9": return "bar";
      case "V3":
      case "V4": return "km/h";
      case "V6":
      case "V7": return "mm";
      case "V2":
      case "V1": return "m";
      case "V10": return "W/m²";
      case "V13":
      case "V12":
      case "V15":
      case "V16": return "µg/m³";
      default: return "";
    }
  };

  const valores = data.map((item) => formatearLectura(item.lectura, code)).filter(v => v !== null) as number[];
  const horas = data.map((item) => item.hora);
  const unidad = getUnidad(code);

  const colores = valores.map((v, i) => {
    if (i === 0) return "#3b82f6";
    return v > valores[i - 1] ? "#ef4444" : "#22c55e";
  });

  // Mostrar todos activos por defecto
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  useEffect(() => {
    if (valores.length > 0 && activeIndexes.length === 0) {
      setActiveIndexes(Array.from({ length: valores.length }, (_, i) => i));
    }
  }, [valores]);

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

  const chartData: ChartData<"line"> = {
    labels: filteredHoras,
    datasets: [
      {
        label: `Lecturas (${unidad})`,
        data: filteredValues,
        borderColor: "#2563eb",
        backgroundColor: "#3b82f6",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: filteredColors,
        fill: {
          target: "origin",
          above: "rgba(59,130,246,0.1)",
        },
      },
    ],
  };

  // Detectar modo oscuro
  const [isDark, setIsDark] = useState(
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => `${context.parsed.y} ${unidad}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: isDark ? "#334155" : "#f1f5f9" },
        ticks: { color: isDark ? "#e2e8f0" : "#4b5563" },
      },
      x: {
        grid: { color: isDark ? "#334155" : "#f1f5f9" },
        ticks: { color: isDark ? "#e2e8f0" : "#4b5563" },
      },
    },
  };

  return (
    <div
      className={`shadow-lg rounded-2xl p-6 w-full max-w-6xl mx-auto hover:shadow-xl transition-shadow duration-300
      ${isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}`}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6 border-b pb-3 dark:border-gray-700">
        <div className="bg-yellow-100 dark:bg-yellow-600/20 p-2 rounded-full">
          <WiDaySunny className="text-yellow-500 text-3xl" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">
          Gráfico de Variable Ambiental (Línea)
        </h2>
      </div>

      {/* Contenedor principal simétrico */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        {/* Gráfico */}
        <div className="w-full md:w-1/2 h-[420px] flex items-center justify-center">
          <Line data={chartData} options={options} />
        </div>

        {/* Leyenda */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-start gap-4 rounded-xl p-4 border
          ${isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-100"
            }`}
        >
          <h3 className="text-md font-semibold border-b pb-2 dark:border-gray-500">
            Detalles de las Lecturas
          </h3>
          <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
            {horas.map((hora, index) => {
              const activo = activeIndexes.includes(index);
              const color = colores[index];
              return (
                <li
                  key={index}
                  onClick={() => toggleIndex(index)}
                  className={`flex justify-between items-center rounded-lg shadow-sm px-3 py-2 cursor-pointer transition-all ${activo
                      ? isDark
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-white hover:bg-blue-50"
                      : isDark
                        ? "bg-gray-800 opacity-60"
                        : "bg-gray-200 opacity-60"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="text-sm">{hora}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color }}>
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

export default EnvironmentalChart;
