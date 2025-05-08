// src/components/AgregarSensorButton.tsx
import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import { FaPlus } from "react-icons/fa";
import ApiRest from "../../service/ApiRest";
import { toast } from "react-toastify";

interface Sensor {
    id: number;
    nombre: string;
    nombre_tipo_sensor: string; 
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface AgregarSensorButtonProps {
    estacionId: number;
}

export const AgregarSensorButton: React.FC<AgregarSensorButtonProps> = ({ estacionId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sensores, setSensores] = useState<Sensor[]>([]);
    const [selectedSensor, setSelectedSensor] = useState<number | null>(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const fetchSensores = async () => {
        try {
            const response = await ApiRest.get<ApiResponse<Sensor[]>>("sensor");
            if (response.data.success) {
                setSensores(response.data.data);
            }
        } catch (error: unknown) {
            console.error("Error al cargar sensores:", error);
            alert("Error al cargar sensores.");
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchSensores();
        }, 10000); // 10 segundos

        fetchSensores();

        return () => clearInterval(intervalId);
    }, []);

    const handleAgregarSensor = async () => {
        if (!selectedSensor) {
            toast.error("Selecciona un sensor para agregar.");
            alert("Selecciona un sensor para agregar.");
            return;
        }

        try {
            const response = await ApiRest.get<ApiResponse<null>>(
                `sensor-estacion?sensor=${selectedSensor}&add=${estacionId}`
            );
            if (response.data.success === true) {
                toast.success("Sensor agregado correctamente.");
                alert("Sensor agregado correctamente.");
                closeModal();
            } else {
                toast.error("Error al agregar el sensor.");
                alert("Error al agregar el sensor.");
            }
        } catch (error: unknown) {
            console.error("Error al agregar el sensor:", error);
            toast.error("Hubo un problema al agregar el sensor.");
            alert("Hubo un problema al agregar el sensor.");
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    openModal();
                    fetchSensores();
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
                <FaPlus />
                Agregar Sensor
            </button>

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
