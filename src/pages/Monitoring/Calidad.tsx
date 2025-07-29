import Card from "./Card";
import { FaSun, FaVolumeUp, FaTemperatureHigh, FaWater } from "react-icons/fa";
import { GiChemicalDrop, GiDustCloud } from "react-icons/gi";
import { MdCo2 } from "react-icons/md";

interface Estacion {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  tipo_estacion_nombre: string;
}

type Props = {
  estacion: Estacion;
};

const icons = {
  radiation: <FaSun className="text-yellow-400 text-2xl" />,
  noise: <FaVolumeUp className="text-blue-400 text-2xl" />,
  co2: <MdCo2 className="text-green-500 text-2xl" />,
  hcho: <GiChemicalDrop className="text-pink-400 text-2xl" />,
  tvoc: <GiChemicalDrop className="text-purple-400 text-2xl" />,
  pm25: <GiDustCloud className="text-orange-400 text-2xl" />,
  pm10: <GiDustCloud className="text-orange-300 text-2xl" />,
  temp: <FaTemperatureHigh className="text-red-400 text-2xl" />,
  humidity: <FaWater className="text-cyan-400 text-2xl" />,
};

const getColorByValue = (type: string, value: number) => {
  switch (type) {
    case "pm25":
      if (value < 12) return "text-green-500";
      if (value < 35) return "text-yellow-400";
      return "text-red-500";
    case "pm10":
      if (value < 20) return "text-green-500";
      if (value < 50) return "text-yellow-400";
      return "text-red-500";
    case "co2":
      if (value < 800) return "text-green-500";
      if (value < 1200) return "text-yellow-400";
      return "text-red-500";
    default:
      return "text-gray-800";
  }
};

const Calidad = ({ estacion }: Props) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Estación: {estacion.nombre}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card title="Radiación Solar" value="556.0" unit="W/m²" icon={icons.radiation} miniGraph />
        <Card title="Ruido Ambiental" value="36.4" unit="%" icon={icons.noise} miniGraph />
        <Card
          title="CO₂"
          value="727"
          unit="ppm"
          icon={icons.co2}
          color={getColorByValue("co2", 727)}
          miniGraph
        />
        <Card title="HCHO" value="0.00" unit="mg/m³" icon={icons.hcho} miniGraph />
        <Card title="TVOC" value="0.13" unit="mg/m³" icon={icons.tvoc} miniGraph />
        <Card
          title="PM2.5"
          value="27"
          unit="µg/m³"
          icon={icons.pm25}
          color={getColorByValue("pm25", 27)}
          miniGraph
        />
        <Card
          title="PM10"
          value="8"
          unit="µg/m³"
          icon={icons.pm10}
          color={getColorByValue("pm10", 8)}
          miniGraph
        />
        <Card title="Temperatura" value="28.8" unit="°C" icon={icons.temp} miniGraph />
        <Card title="Humedad" value="82" unit="%" icon={icons.humidity} miniGraph />
      </div>
    </div>
  );
};

export default Calidad;
