import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiRest from "../../service/ApiRest";
import PageMeta from "../../components/common/PageMeta";
import VariablesMrv from "./VariablesMrv";

interface Estacion {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  tipo_estacion_nombre: string;
  estacion_mrv: number | null;
}

const Variables: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [estacion, setEstacion] = useState<Estacion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de estación no proporcionado");
      setLoading(false);
      return;
    }

    const fetchEstacion = async () => {
      try {
        const response = await ApiRest.get(`obtenerEstacion?id=${id}`);
        const data = response.data?.data;

        if (Array.isArray(data) && data.length > 0) {
          setEstacion(data[0]);
        } else {
          setError("No se encontró la estación.");
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la estación.");
      } finally {
        setLoading(false);
      }
    };

    fetchEstacion();
  }, [id]);

  const renderContenido = () => {
    if (loading) return <p>Cargando...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (!estacion) return <p>No hay información disponible.</p>;

    const idEstacion = estacion.estacion_mrv && estacion.estacion_mrv > 0
      ? estacion.estacion_mrv
      : estacion.id;

    return <VariablesMrv idEstacion={idEstacion} />;
  };

  return (
    <>
      <PageMeta
        title="Monitoreo"
        description="Monitoreo de la estación."
      />
      <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Variables disponibles de la estación
          </h1>
        </div>
        <div className="col-span-12 xl:col-span-5">
          {renderContenido()}
        </div>
      </div>
    </>
  );
};

export default Variables;
