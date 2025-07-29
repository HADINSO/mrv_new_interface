import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { WiDaySunny } from 'react-icons/wi';

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
      case "V5":
        return parseFloat(num.toFixed(1));
      case "V8":
        return Math.round(num);
      case "V9":
        return valorStr.length > 5 ? num / 100000 : parseFloat(`0.${valorStr.padStart(5, "0")}`);
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

  const chartData = {
    labels: horas,
    datasets: [
      {
        label: `Lecturas (${unidad})`,
        data: valores,
        fill: false,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: { beginAtZero: false },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <WiDaySunny className="text-yellow-400 text-3xl" />
        <h2 className="text-xl font-semibold text-gray-800">Gráfico de Variable Ambiental #1</h2>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default EnvironmentalChart;
