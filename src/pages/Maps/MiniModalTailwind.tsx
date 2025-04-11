import { FaTemperatureHigh, FaCloudRain, FaLeaf } from "react-icons/fa";

interface MiniModalProps {
  location: {
    nombre: string;
    descripcion: string;
  };
}

const MiniModal: React.FC<MiniModalProps> = ({ location }) => {
  return (
    <div className="absolute bg-white shadow-xl rounded-md px-4 py-3 bottom-24 left-5 max-w-sm z-50">
      <h2 className="font-bold text-lg">{location.nombre}</h2>
      <p className="text-sm text-gray-600">{location.descripcion}</p>
      <div className="flex items-center mt-2 space-x-4 text-green-700">
        <FaTemperatureHigh />
        <FaCloudRain />
        <FaLeaf />
      </div>
    </div>
  );
};

export default MiniModal;
