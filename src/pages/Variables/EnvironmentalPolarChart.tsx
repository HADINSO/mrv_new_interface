import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { WiBarometer } from 'react-icons/wi'; // Ícono base

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

const EnvironmentalPolarChart: React.FC<EnvironmentalPolarChartProps> = ({ data, code }) => {
  const formatearLectura = (lectura: string, codigo: string): number | null => {
    const regex = new RegExp(`(\\d+(\\.\\d+)?)(?=${codigo})`);
    const match = lectura.match(regex);
    const valorStr = match ? match[1] : null;
    if (!valorStr) return null;

    const num = parseFloat(valorStr);
    if (isNaN(num)) return null;

    switch (codigo) {
      case "V5": return parseFloat(num.toFixed(1)); // °C
      case "V8": return Math.round(num); // %
      case "V9":
        return valorStr.length > 5
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

  const chartData: ChartData<'polarArea'> = {
    labels: horas,
    datasets: [
      {
        label: `Lecturas (${unidad})`,
        data: valores,
        backgroundColor: [
          '#3b82f6cc',
          '#60a5facc',
          '#93c5fdcc',
          '#bfdbfecc',
          '#dbeafecc',
          '#e0f2fecc',
          '#f0f9ffcc',
        ],
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'polarArea'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
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
          color: '#4b5563',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <WiBarometer className="text-blue-500 text-3xl" />
        <h2 className="text-xl font-semibold text-gray-800">
          Gráfico de Variable Ambiental #2
        </h2>
      </div>
      <PolarArea data={chartData} options={options} />
    </div>
  );
};

export default EnvironmentalPolarChart;
