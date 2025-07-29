// @ts-nocheck
import { useEffect, useState } from "react";
import {
  FaMapMarkerAlt,
  FaRadiation,
  FaWater,
  FaTrash,
  FaTools,
  FaEye,
  FaCloudSunRain,
  FaWind,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import ApiRest from "../../service/ApiRest";
import { AgregarSensorButton } from "./AgregarSensorButton";
import Swal from "sweetalert2";
import LoaderCirculo from "../../components/Loader/LoaderCirculo";
import { Link } from "react-router";

interface Estacion {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  tipo_estacion: string;
}

interface Sensor {
  id: number;
  nombre: string;
  tipo_sensor: string;
}

const tipoEstacion: Record<number, { nombre: string; icono: React.ReactNode }> = {
  1: { nombre: "Hidrológico", icono: <FaWater className="text-blue-500 text-2xl" /> },
  2: { nombre: "Meteorológico", icono: <FaCloudSunRain className="text-cyan-500 text-2xl" /> },
  3: { nombre: "AiQ", icono: <FaWind className="text-green-500 text-2xl" /> },
  4: { nombre: "Otros", icono: <FaRadiation className="text-yellow-500 text-2xl" /> },
};

export const EstacionManager: React.FC = () => {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [selectedEstacion, setSelectedEstacion] = useState<Estacion | null>(null);

  const {
    isOpen: isOpenSensors,
    openModal: openSensorModal,
    closeModal: closeSensorModal,
  } = useModal();

  useEffect(() => {
    const fetchEstaciones = async () => {
      try {
        const response = await ApiRest.get("estaciones");
        setEstaciones(response.data.data);
      } catch (error) {
        console.error("Error al cargar estaciones:", error);
      }
    };

    fetchEstaciones();
    const intervalId = setInterval(fetchEstaciones, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchSensors = async () => {
      if (!selectedEstacion?.id) return;
      setLoading(true);
      try {
        const response = await ApiRest.get("sensor-estacion", {
          params: { id: selectedEstacion.id },
        });
        if (response.data.success) setSensores(response.data.data);
      } catch (error) {
        console.error("Error al cargar los sensores:", error);
        toast.error("No se pudieron cargar los sensores");
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, [selectedEstacion]);

  const getIcon = (tipoId: number): JSX.Element => {
    return tipoEstacion[tipoId]?.icono || <FaMapMarkerAlt className="text-gray-500 text-2xl" />;
  };

  const handleDeleteSensor = async (id: number) => {
    const confirmDelete = window.confirm("Esta acción desvinculará el sensor. ¿Deseas continuar?");
    if (!confirmDelete) return;

    try {
      const response = await ApiRest.post("sensor-estacion-delete", { id });
      if (response.data.success) {
        toast.success("Sensor desvinculado correctamente");
        setSensores((prev) => prev.filter((sensor) => sensor.id !== id));
      } else {
        toast.error("No se pudo desvincular el sensor.");
      }
    } catch (error) {
      toast.error("Error al intentar desvincular el sensor");
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la estación de forma permanente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await ApiRest.post('delete/estaciones', { id });
        setEstaciones(prev => prev.filter(est => est.id !== id));
        toast.success('Estación eliminada correctamente');
      } catch (error) {
        console.error('Error eliminando estación:', error);
        toast.error('Ocurrió un error al eliminar la estación');
      }
    }

  };

  const handleOpenSensorModal = (estacion: Estacion) => {
    setSelectedEstacion(estacion);
    openSensorModal();
  };

  return (
    <>
    
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {estaciones.map((estacion) => (
          <div
            key={estacion.id}
            onClick={() => handleOpenSensorModal(estacion)}
            className="border rounded-2xl shadow-md hover:shadow-lg p-6 cursor-pointer transition-all flex flex-col justify-between bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
          >
            <div className="flex items-center gap-4 mb-4">
              {getIcon(estacion.id_tipo_estacion)}
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{estacion.nombre} {'-> ID:'} {estacion.id}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{estacion.descripcion}</p>
            <p className="text-gray-400 dark:text-gray-400 text-xs mb-4">
              Lat: {estacion.lat} | Lng: {estacion.lng}
            </p>
            <div className="flex justify-between items-center mt-auto">
              <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                {tipoEstacion[estacion.id_tipo_estacion]?.nombre || estacion.tipo_estacion}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(estacion.id);
                }}
                className="text-red-500 hover:text-red-600 transition-all"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isOpenSensors} onClose={closeSensorModal} className="max-w-5xl p-8 bg-green-50 dark:bg-gray-900 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6 border-b border-green-300 dark:border-gray-600 pb-4">
          <h2 className="text-3xl font-bold text-green-800 dark:text-white">Administrar Sensores</h2>
          <FaTools className="text-3xl text-green-700 dark:text-white" />
        </div>

        {selectedEstacion && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-green-200 dark:border-gray-600">
              <p className="text-green-800 dark:text-white"><strong>Estación:</strong> {selectedEstacion.nombre}</p>
              <p className="text-green-800 dark:text-white"><strong>Descripción:</strong> {selectedEstacion.descripcion}</p>
            </div>

            <div className="flex justify-between items-center">
              <Link
                to={`/monitoring/${selectedEstacion.id}`}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                <FaEye className="text-white" />
                Ver estación
              </Link>

              <AgregarSensorButton
                estacionId={selectedEstacion.id}
                onSensorAdded={(sensor: Sensor) => setSensores((prev) => [...prev, sensor])}
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <LoaderCirculo />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-green-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-green-100 dark:bg-gray-700 text-green-800 dark:text-white uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">ID</th>
                      <th className="py-3 px-6 text-left">Nombre Sensor</th>
                      <th className="py-3 px-6 text-left">Tipo</th>
                      <th className="py-3 px-6 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-green-900 dark:text-white text-sm font-light">
                    {sensores.map((sensor) => (
                      <tr key={sensor.id} className="border-b border-green-100 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-6 text-left">{sensor.id}</td>
                        <td className="py-3 px-6 text-left">{sensor.nombre}</td>
                        <td className="py-3 px-6 text-left">{sensor.tipo_sensor}</td>
                        <td className="py-3 px-6 text-left">
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                            onClick={() => handleDeleteSensor(sensor.id)}
                          >
                            Desvincular
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
