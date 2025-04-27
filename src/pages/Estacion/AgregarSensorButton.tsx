// src/components/AgregarSensorButton.tsx
import { useState } from "react";
import { Modal } from "../../components/ui/modal";
import { FaPlus } from "react-icons/fa";
import ApiRest from "../../service/ApiRest";
import { toast } from "react-toastify";

interface Sensor {
    id: number;
    nombre: string;
    tipo_sensor: string;
}

interface AgregarSensorButtonProps {
    estacionId: number; // El ID de la estación a la que se agregará el sensor
}

export const AgregarSensorButton: React.FC<AgregarSensorButtonProps> = ({ estacionId }) => {
    const [isOpen, setIsOpen] = useState(false); // Para manejar el estado del modal
    const [sensores, setSensores] = useState<Sensor[]>([]);
    const [selectedSensor, setSelectedSensor] = useState<number | null>(null); // Para manejar el sensor seleccionado

    // Abrir el modal
    const openModal = () => setIsOpen(true);

    // Cerrar el modal
    const closeModal = () => setIsOpen(false);

    // Cargar sensores disponibles
    const fetchSensores = async () => {
        try {
            const response = await ApiRest.get("sensor");
            if (response.data.success) {
                setSensores(response.data.data);
            }
        } catch (error) {
            console.error("Error al cargar sensores:", error);
        }
    };

    const handleAgregarSensor = async () => {
        if (!selectedSensor) {
            toast.error("Selecciona un sensor para agregar.");
            return;
        }

        try {
            // Aquí agregamos el sensor a la estación
            const response = await ApiRest.post(`sensor-estacion/add/${selectedSensor}/${estacionId}`);
            if (response.data.success) {
                toast.success("Sensor agregado correctamente.");
                closeModal(); // Cerramos el modal después de agregar el sensor
            } else {
                toast.error("Error al agregar el sensor.");
            }
        } catch (error) {
            console.error("Error al agregar el sensor:", error);
            toast.error("Hubo un problema al agregar el sensor.");
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    openModal();
                    fetchSensores(); // Cargar sensores cuando se abra el modal
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
                <FaPlus className="mr-2" />
                Agregar Sensor
            </button>

            {/* Modal para agregar sensor */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Agregar Sensor a la Estación</h2>
                <div className="space-y-4">
                    <label className="block text-gray-700">Selecciona un Sensor</label>
                    <select
                        value={selectedSensor ?? ""}
                        onChange={(e) => setSelectedSensor(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">-- Selecciona un sensor --</option>
                        {sensores.map((sensor) => (
                            <option key={sensor.id} value={sensor.id}>
                                {sensor.nombre} ({sensor.nombre_tipo_sensor})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAgregarSensor}
                        className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all"
                    >
                        Agregar Sensor
                    </button>
                </div>
            </Modal>
        </>
    );
};
