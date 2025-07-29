import { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import { EstacionManager } from "./Estacion/EstacionManager";
import ApiRest from "../service/ApiRest";

interface Estacion {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  imagen?: File | null;
}

const Estacion: React.FC = () => {
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [tiposEstacion, setTiposEstacion] = useState<{ id: number; nombre: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newEstacion, setNewEstacion] = useState<Estacion>({
    id: 0,
    nombre: "",
    descripcion: "",
    lat: "",
    lng: "",
    id_tipo_estacion: 1,
    imagen: null,
  });

  const { isOpen, openModal, closeModal } = useModal();

  const handleCreate = async () => {
    if (!newEstacion.nombre.trim()) return alert("El nombre es obligatorio.");
    if (!newEstacion.descripcion.trim()) return alert("La descripción es obligatoria.");
    if (!newEstacion.lat.trim()) return alert("La latitud es obligatoria.");
    if (!newEstacion.lng.trim()) return alert("La longitud es obligatoria.");
    if (!newEstacion.id_tipo_estacion) return alert("Debe seleccionar un tipo de estación.");
    if (!newEstacion.imagen) return alert("Debe seleccionar una imagen.");

    const formData = new FormData();
    formData.append("nombre", newEstacion.nombre);
    formData.append("descripcion", newEstacion.descripcion);
    formData.append("lat", newEstacion.lat);
    formData.append("lng", newEstacion.lng);
    formData.append("id_tipo_estacion", String(newEstacion.id_tipo_estacion));
    formData.append("imagen", newEstacion.imagen);

    try {
      const response = await ApiRest.post("add/estacion", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      if (response.data.success) {
        const newId = estaciones.length > 0 ? estaciones[estaciones.length - 1].id + 1 : 1;
        setEstaciones((prev) => [...prev, { ...newEstacion, id: newId }]);
        alert("Estación creada correctamente");
        closeModal();
        setNewEstacion({
          id: 0,
          nombre: "",
          descripcion: "",
          lat: "",
          lng: "",
          id_tipo_estacion: 0,
          imagen: null,
        });
        setUploadProgress(0);
      } else {
        alert("Error al crear la estación.");
        setUploadProgress(0);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Ocurrió un error al subir la imagen.");
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    ApiRest.get("/tipos-estacion")
      .then((res) => {
        if (res.data.success) setTiposEstacion(res.data.data);
      })
      .catch((err) => console.error("Error al cargar tipos:", err));
  }, []);

  return (
    <>
      <PageMeta title="Estaciones & Sensores" description="Gestión de estaciones y sensores." />
      <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Gestión de Estaciones
          </h1>
          <button
            onClick={openModal}
            className="mt-4 md:mt-0 px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition dark:bg-brand-400 dark:hover:bg-brand-500"
          >
            + Agregar Estación
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
          <EstacionManager />
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Crear Nueva Estación
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              value={newEstacion.nombre}
              onChange={(e) => setNewEstacion({ ...newEstacion, nombre: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newEstacion.descripcion}
              onChange={(e) => setNewEstacion({ ...newEstacion, descripcion: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Latitud"
              value={newEstacion.lat}
              onChange={(e) => setNewEstacion({ ...newEstacion, lat: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Longitud"
              value={newEstacion.lng}
              onChange={(e) => setNewEstacion({ ...newEstacion, lng: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
            <select
              value={newEstacion.id_tipo_estacion}
              onChange={(e) =>
                setNewEstacion({
                  ...newEstacion,
                  id_tipo_estacion: Number(e.target.value),
                })
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccione un tipo de estación</option>
              {tiposEstacion.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewEstacion({
                  ...newEstacion,
                  imagen: e.target.files?.[0] || null,
                })
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full text-xs text-white text-center"
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
            )}

            <button
              onClick={handleCreate}
              className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              Crear Estación
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Estacion;
