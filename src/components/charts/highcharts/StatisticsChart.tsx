import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FaCloudRain } from "react-icons/fa";
import ApiHelsy from "../../../service/ApiHelsy";

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
  const data = datosLluvia.map((d) => parseFloat(d.dato || "0") / 10);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#1E3A8A",
      },
    },
    colors: ["#1D4ED8"],
    chart: {
      height: 320,
      type: "area",
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: {
      curve: "straight",
      width: 4,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.7,
        gradientToColors: ["#60A5FA"],
        opacityFrom: 0.7,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    markers: {
      size: 6,
      colors: ["#3B82F6"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    grid: {
      borderColor: "#E0F2FE",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      x: {
        formatter: (val: number): string => `Hora: ${val}`,
      },
      y: {
        formatter: (val: number): string => `${val} mm`,
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#1E3A8A",
          fontWeight: 600,
          fontSize: "12px",
        },
        rotate: -45,
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: {
          colors: "#1E3A8A",
          fontWeight: 600,
          fontSize: "12px",
        },
      },
      title: {
        text: "Lluvia (mm)",
        style: {
          color: "#2563EB",
          fontWeight: "700",
          fontSize: "14px",
        },
      },
    },
  };

  const series = [
    {
      name: "Lluvia últimas 24h",
      data,
    },
  ];

  return (
    <div className="rounded-3xl border border-blue-300 bg-blue-50/60 px-6 pb-6 pt-6 shadow-lg dark:bg-blue-900/20 dark:border-blue-700">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FaCloudRain className="text-blue-600 text-3xl animate-pulse" />
          <div>
            <h3 className="text-2xl font-extrabold text-blue-800 dark:text-blue-300">
              Lluvia últimas 24 horas
            </h3>
            <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">
              Acumulado de lluvia registrado por minuto
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-blue-600">Cargando datos de lluvia...</p>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[900px] xl:min-w-full">
            <Chart options={options} series={series} type="area" height={320} />
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-blue-600 dark:text-blue-400 text-xs font-light italic">
        Datos en tiempo casi real desde estaciones meteorológicas.
      </p>
    </div>
  );
}
