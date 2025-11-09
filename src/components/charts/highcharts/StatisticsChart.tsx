import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FaCloudRain } from "react-icons/fa";
import ApiHelsy from "../../../service/ApiHelsy";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type ApiDato = {
  lectura: string;
  hora: string;
  fecha: string;
};

type LluviaDato = {
  dato: string;
  hora: string;
};

type Props = {
  estacion: number;
};

export default function RainfallChart({ estacion }: Props) {
  const [datosLluvia, setDatosLluvia] = useState<LluviaDato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const obtenerDatos = async () => {
      try {
        const res = await ApiHelsy.get<ApiDato[]>(`previewDetailCharts/${estacion}/V7`);
        const procesado = res.data.map((item) => ({
          dato: item.lectura.replace(/[^\d.]/g, ""),
          hora: item.hora,
        }));
        setDatosLluvia(procesado);
      } catch (err) {
        console.error("Error al obtener datos de lluvia:", err);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
    intervalId = setInterval(obtenerDatos, 30000);
    return () => clearInterval(intervalId);
  }, [estacion]);

  const categories = datosLluvia.map((d) => d.hora);
  const dataValues = datosLluvia.map((d) => parseFloat(d.dato || "0") / 10);

  // --- Tema dinámico ---
  const isDarkMode =
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark"));

  const primaryColor = isDarkMode ? "#34D399" : "#16A34A";
  const secondaryColor = isDarkMode ? "#059669" : "#4ADE80";
  const labelColor = isDarkMode ? "#D1D5DB" : "#14532D";
  const gridColor = isDarkMode ? "#374151" : "#DCFCE7";

  // --- Configuración Chart.js ---
  const data = {
    labels: categories,
    datasets: [
      {
        label: "Lluvia últimas 24h (mm)",
        data: dataValues,
        borderColor: primaryColor,
        backgroundColor: secondaryColor + "33", // 20% transparencia
        pointBackgroundColor: primaryColor,
        pointBorderColor: "#fff",
        tension: 0.4, // suaviza la curva
        borderWidth: 3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: labelColor,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? "#064E3B" : "#ECFDF5",
        titleColor: isDarkMode ? "#A7F3D0" : "#064E3B",
        bodyColor: isDarkMode ? "#D1FAE5" : "#065F46",
        borderColor: secondaryColor,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: {
          color: labelColor,
          maxRotation: 45,
          minRotation: 0,
          font: { size: 11, weight: "500" },
        },
        grid: {
          color: gridColor,
          drawTicks: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: labelColor,
          font: { size: 11, weight: "500" },
          callback: (value: number) => `${value} mm`,
        },
        grid: {
          color: gridColor,
          drawTicks: false,
        },
      },
    },
  };

  // --- Renderizado ---
  return (
    <div className="rounded-3xl border border-green-300 bg-green-50/60 px-6 pb-6 pt-6 shadow-xl dark:bg-gray-900/50 dark:border-green-700 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FaCloudRain className="text-green-600 dark:text-green-400 text-3xl animate-pulse" />
          <div>
            <h3 className="text-2xl font-extrabold text-gray-800 dark:text-green-300">
              Lluvia últimas 24 horas
            </h3>
            <p className="text-gray-600 dark:text-green-400 text-sm font-medium">
              Acumulado de lluvia registrado por minuto
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-green-600 dark:text-green-400 py-10 font-semibold">
          Cargando datos de lluvia...
        </p>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[700px] md:min-w-[900px] xl:min-w-full h-[320px]">
            {/* @ts-ignore */}
            <Line data={data} options={options} />
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-gray-500 dark:text-green-500 text-xs font-light italic">
        Datos en tiempo casi real desde estaciones meteorológicas.
      </p>
    </div>
  );
}
