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
  FaInfoCircle,
  FaTrashAlt,
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
  3: { nombre: "Calidad del Aire", icono: <FaWind className="text-green-500 text-2xl" /> },
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
      } catch {
        toast.error("No se pudieron cargar los sensores");
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
  }, [selectedEstacion]);

  const getIcon = (tipoId: number): JSX.Element =>
    tipoEstacion[tipoId]?.icono || <FaMapMarkerAlt className="text-gray-500 text-2xl" />;

  const handleDeleteSensor = async (id: number) => {
    const confirmDelete = window.confirm(
      "¿Desvincular sensor?\n\nEsta acción no eliminará el sensor, solo lo desvinculará."
    );
    if (!confirmDelete) return;

    try {
      const response = await ApiRest.post("sensor-estacion-delete", { id });
      if (response.data.success) {
        setSensores((prev) => prev.filter((s) => s.id !== id));
        toast.success("Sensor desvinculado correctamente");
      } else {
        toast.error("No se pudo desvincular el sensor.");
      }
    } catch {
      toast.error("Error al intentar desvincular el sensor");
    }
  };


  const handleDeleteEstacion = async (id: number) => {
    const confirmDelete = window.confirm(
      "¿Eliminar estación?\n\nEsta acción eliminará la estación permanentemente."
    );
    if (!confirmDelete) return;

    try {
      await ApiRest.post("delete/estaciones", { id });
      setEstaciones((prev) => prev.filter((e) => e.id !== id));
      toast.success("Estación eliminada correctamente");
    } catch {
      toast.error("Error al eliminar la estación");
    }
  };


  const handleOpenSensorModal = (estacion: Estacion) => {
    setSelectedEstacion(estacion);
    openSensorModal();
  };

  return (
    <>
      {/* === Tarjetas de estaciones === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {estaciones.map((estacion) => (
          <div
            key={estacion.id}
            onClick={() => handleOpenSensorModal(estacion)}
            className="group relative border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-gray-800 p-6 cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              {getIcon(estacion.id_tipo_estacion)}
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                {estacion.nombre}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
              {estacion.descripcion}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Lat: {estacion.lat} | Lng: {estacion.lng}
            </p>
            <div className="flex justify-between items-center">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                {tipoEstacion[estacion.id_tipo_estacion]?.nombre || estacion.tipo_estacion}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEstacion(estacion.id);
                }}
                title="Eliminar estación"
                className="text-red-500 hover:text-red-600 transition-transform transform hover:scale-110"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* === Modal de Sensores === */}
      <Modal
        isOpen={isOpenSensors}
        onClose={closeSensorModal}
        // MODAL: Mayor padding, sombra más definida (shadow-2xl), esquinas más suaves (rounded-3xl).
        // La clase 'z-50' puede ser necesaria si el Modal no la maneja internamente.
        className="max-w-6xl p-10 rounded-3xl bg-white dark:bg-gray-950 shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300"
      >
        {selectedEstacion && (
          <>
            {/* HEADER: Título más impactante y jerarquía clara */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-extrabold text-green-600 dark:text-green-400 flex items-center gap-3">
                {/* Ícono de FaTools con un color más vibrante */}
                <FaTools className="text-4xl text-green-500 dark:text-green-400" />
                Administrar Sensores
              </h2>
            </div>

            {/* INFORMACIÓN DE LA ESTACIÓN: Diseño de "tarjeta" más prominente (UX: contexto claro) */}
            <div className="bg-green-50 dark:bg-gray-800/70 p-5 rounded-2xl border border-green-200 dark:border-gray-700 mb-8 shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Detalles de la Estación
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-base mb-1">
                <strong className="font-bold text-gray-900 dark:text-gray-50">Estación:</strong> {selectedEstacion.nombre}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                <strong className="font-bold text-gray-900 dark:text-gray-50">Descripción:</strong> {selectedEstacion.descripcion}
              </p>
            </div>

            {/* BOTONES DE ACCIÓN: Mejor espaciado y botones con estilos más modernos */}
            <div className="flex justify-end items-center mb-8 gap-4">
              {/* Botón Ver Estación: Estilo de botón secundario (outline) para no competir con "Agregar" */}
              <Link
                to={`/monitoring/${selectedEstacion.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-gray-800 transition font-medium shadow-sm"
              >
                <FaEye /> Ver Monitoreo
              </Link>
              {/* Agregar Sensor: Botón primario, más prominente, con un estilo más "elevado" */}
              <AgregarSensorButton
                estacionId={selectedEstacion.id}
                onSensorAdded={(sensor: Sensor) =>
                  setSensores((prev) => [...prev, sensor])
                }
                // Ajusta el componente AgregarSensorButton para aceptar estas clases
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition font-semibold shadow-md hover:shadow-lg dark:bg-green-500 dark:hover:bg-green-600"
              />
            </div>

            {/* LISTA DE SENSORES */}
            {loading ? (
              <div className="flex justify-center py-16">
                <LoaderCirculo />
                <p className="ml-3 text-gray-500 dark:text-gray-400">Cargando sensores...</p>
              </div>
            ) : sensores.length > 0 ? (
              // TABLA: Más énfasis en las esquinas redondeadas y sombra sutil
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  {/* ENCABEZADOS: Fondo más sobrio y contraste en texto */}
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tipo de Sensor</th> {/* Nomenclatura más clara */}
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  {/* CUERPO DE LA TABLA: Mejor hover y separación visual */}
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {sensores.map((sensor) => (
                      <tr
                        key={sensor.id}
                        className="text-gray-800 dark:text-gray-200 hover:bg-green-50/50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{sensor.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{sensor.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {/* Podrías añadir un Badge (etiqueta) para el tipo de sensor para mejor UX */}
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                            {sensor.tipo_sensor}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {/* Botón de Desvincular con ícono y mejor hover */}
                          <button
                            onClick={() => handleDeleteSensor(sensor.id)}
                            className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition shadow-sm hover:shadow-md"
                          >
                            <FaTrashAlt />
                            Desvincular
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ESTADO VACÍO: Más informativo y con un ícono */
              <div className="text-center bg-gray-50 dark:bg-gray-800/70 p-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 my-8">
                <FaInfoCircle className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  Aún no hay sensores asociados a esta estación.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Utiliza el botón **"Agregar Sensor"** para vincular uno nuevo.
                </p>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};
