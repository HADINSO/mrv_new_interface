// src/components/EstacionManager.tsx
import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaRadiation, FaWater, FaTrash, FaPlus, FaTools } from "react-icons/fa";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import ApiRest from "../../service/ApiRest";
import { AgregarSensorButton } from "./AgregarSensorButton";
import Swal from "sweetalert2";
import LoaderCirculo from "../../components/Loader/LoaderCirculo";

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

export const EstacionManager: React.FC = () => {
    const [sensores, setSensores] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState(true);
    const [estaciones, setEstaciones] = useState<Estacion[]>([]);
    const [newEstacion, setNewEstacion] = useState({
        nombre: "",
        descripcion: "",
        lat: "",
        lng: "",
        id_tipo_estacion: 1,
        tipo_estacion: "",
    });
    const { isOpen, openModal, closeModal } = useModal();
    const { isOpen: isOpenSensors, openModal: openSensorModal, closeModal: closeSensorModal } = useModal();
    const [selectedEstacion, setSelectedEstacion] = useState<Estacion | null>(null);

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
    }, []);
    useEffect(() => {
        const fetchSensors = async () => {
            setLoading(true)
            if (!selectedEstacion?.id) return;

            try {
                const response = await ApiRest.get("sensor-estacion", {
                    params: { id: selectedEstacion.id }
                });
                if (response.data.success) {
                    setSensores(response.data.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar los sensores:", error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchSensors();
    }, [selectedEstacion]);



    const getIcon = (tipo: string) => {
        if (tipo.includes("Radiación")) return <FaRadiation className="text-yellow-500 text-2xl" />;
        if (tipo.includes("Hidrológico")) return <FaWater className="text-blue-500 text-2xl" />;
        return <FaMapMarkerAlt className="text-gray-500 text-2xl" />;
    };
    const handleDeleteSensor = async (id: number) => {
        const confirmDelete = window.confirm("Esta acción desvinculará el sensor. ¿Deseas continuar?");
        if (!confirmDelete) return;

        try {
            const response = await ApiRest.post("sensor-estacion-delete", { id });

            if (response.data.success) {
                window.alert("Sensor desvinculado correctamente");
            } else {
                toast.error("No se pudo desvincular el sensor. Intenta nuevamente.");
            }
        } catch (error) {
            console.error("Error al desvincular el sensor:", error);
            toast.error("Ocurrió un error al intentar desvincular el sensor");
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
                await ApiRest.delete(`estaciones/${id}`);
                setEstaciones(estaciones.filter((estacion) => estacion.id !== id));
                toast.success("Estación eliminada correctamente");
            } catch (error) {
                console.error("Error al eliminar la estación:", error);
                toast.error("Hubo un error al eliminar la estación");
            }
        }
    };

    const handleCreate = () => {
        const newId = estaciones.length > 0 ? estaciones[estaciones.length - 1].id + 1 : 1;
        const nueva = { ...newEstacion, id: newId };
        setEstaciones([...estaciones, nueva]);
        setNewEstacion({
            nombre: "",
            descripcion: "",
            lat: "",
            lng: "",
            id_tipo_estacion: 1,
            tipo_estacion: "",
        });
        closeModal();
        toast.success("Estación creada correctamente");
    };

    const handleOpenSensorModal = (estacion: Estacion) => {
        setSelectedEstacion(estacion);
        openSensorModal();
    };

    return (
        <>
            <div className="flex justify-end mb-6">
                <button
                    onClick={openModal}
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition-all shadow-md"
                >
                    <FaPlus /> Crear Estación
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {estaciones.map((estacion) => (
                    <div
                        key={estacion.id}
                        onClick={() => handleOpenSensorModal(estacion)}
                        className="border rounded-2xl shadow-md hover:shadow-lg p-6 cursor-pointer transition-all flex flex-col justify-between bg-white hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {getIcon(estacion.tipo_estacion)}
                            <h3 className="text-lg font-bold text-gray-800">{estacion.nombre}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{estacion.descripcion}</p>
                        <p className="text-gray-400 text-xs mb-4">
                            Lat: {estacion.lat} | Lng: {estacion.lng}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {estacion.tipo_estacion}
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

            {/* Modal de creación */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Crear Nueva Estación</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={newEstacion.nombre}
                        onChange={(e) => setNewEstacion({ ...newEstacion, nombre: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={newEstacion.descripcion}
                        onChange={(e) => setNewEstacion({ ...newEstacion, descripcion: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        placeholder="Latitud"
                        value={newEstacion.lat}
                        onChange={(e) => setNewEstacion({ ...newEstacion, lat: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        placeholder="Longitud"
                        value={newEstacion.lng}
                        onChange={(e) => setNewEstacion({ ...newEstacion, lng: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        placeholder="Tipo de estación"
                        value={newEstacion.tipo_estacion}
                        onChange={(e) => setNewEstacion({ ...newEstacion, tipo_estacion: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        onClick={handleCreate}
                        className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all"
                    >
                        Crear Estación
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isOpenSensors} onClose={closeSensorModal} className="max-w-5xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold">Administrar Sensores</h2>
                    <FaTools className="text-3xl text-gray-600" />
                </div>

                {selectedEstacion ? (
                    <div className="space-y-6">
                        <div>
                            <p><strong>Estación:</strong> {selectedEstacion.nombre}</p>
                            <p><strong>Descripción:</strong> {selectedEstacion.descripcion}</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg shadow">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                        <th className="py-3 px-6 text-left">ID</th>
                                        <th className="py-3 px-6 text-left">Nombre Sensor</th>
                                        <th className="py-3 px-6 text-left">Tipo</th>
                                        <th className="py-3 px-6 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 text-sm font-light">
                                {loading ? (  <LoaderCirculo />) : null}
                                    {sensores.map((sensor) => (
                                        <tr key={sensor.id} className="border-b border-gray-200 hover:bg-gray-100">
                                            <td className="py-3 px-6 text-left">{sensor.id}</td>
                                            <td className="py-3 px-6 text-left">{sensor.nombre}</td>
                                            <td className="py-3 px-6 text-left">{sensor.tipo_sensor}</td>
                                            <td className="py-3 px-6 text-left">
                                                <button
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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

                        <div className="mt-7 text-right">
                            <AgregarSensorButton estacionId={selectedEstacion?.id ?? 0} />
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No se ha seleccionado estación.</p>
                )}
            </Modal>
        </>
    );
};
