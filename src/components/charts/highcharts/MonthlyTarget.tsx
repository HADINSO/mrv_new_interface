// src/components/charts/highcharts/MonthlyTarget.tsx
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { WiStrongWind } from "react-icons/wi";
import ApiHelsy from "../../../service/ApiHelsy";

interface Lectura {
  id: number;
  lectura: string;
  hora: string;
  fecha: string;
}

type Props = {
  estacion: number;
};

const MonthlyTarget = ({ estacion }: Props) => {
  const [windSpeed, setWindSpeed] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const matchDark = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(matchDark.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    matchDark.addEventListener("change", handleChange);
    return () => matchDark.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiHelsy.get<Lectura[]>(`previewDetailCharts/${estacion}/V4`);
        const datos = response.data;

        if (datos.length > 0) {
          const ultimaLectura = datos[datos.length - 1].lectura.replace(/[^\d.]/g, "");
          setWindSpeed(parseFloat(ultimaLectura));
        }
      } catch (error) {
        console.error("Error al obtener las lecturas:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [estacion]);

  const windSpeedKmH = windSpeed * 3.6;
  const series: number[] = [Math.min((windSpeedKmH / 100) * 100, 100)];

  const options: ApexOptions = {
    chart: {
      height: 250,
      type: "radialBar",
      sparkline: { enabled: true },
      foreColor: isDarkMode ? "#f8fafc" : "#1e293b",
    },
    colors: ["#2563eb"],
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        track: {
          background: isDarkMode ? "#1e293b" : "#f1f5f9",
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "1.8rem",
            fontWeight: 600,
            offsetY: 10,
            color: isDarkMode ? "#f8fafc" : "#1e293b",
            formatter: () => `${windSpeedKmH.toFixed(1)} km/h`,
          },
        },
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Velocidad del viento"],
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 h-full flex flex-col justify-center items-center transition-colors duration-300">
      <div className="flex items-center gap-3 mb-4">
        <WiStrongWind className="text-blue-600 dark:text-blue-400 text-4xl" />
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
          Velocidad del Viento
        </h2>
      </div>
      <div className="w-full flex justify-center min-h-[240px]">
        <Chart
          options={options}
          series={series}
          type="radialBar"
          height={240}
        />
      </div>
    </div>
  );
};

export default MonthlyTarget;
