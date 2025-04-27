import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaSearch, FaMicrochip, FaTemperatureHigh, FaTemperatureLow, FaBarcode, FaChartLine, FaLayerGroup, FaPlus } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import ApiRest from '../service/ApiRest';
import ApiConfig from '../service/ApiConfig';
import { Modal } from "../components/ui/modal";
import '@sweetalert2/theme-dark/dark.css';
import Swal from 'sweetalert2';


type Sensor = {
    id: number;
    nombre: string;
    minimo: string;
    maximo: string;
    codigo: string;
    nombre_grafico: string;
    rango_chart: number;
    grafico: number;
    tipo_sensor: number;
    nombre_tipo_sensor: string;
};

type TipoSensor = {
    id: number;
    nombre: string;
};

type Grafico = {
    id: number;
    nombre: string;
    img: string;
};
const SensoresPage: React.FC = () => {
    const [sensores, setSensores] = useState<Sensor[]>([]);
    const [filtered, setFiltered] = useState<Sensor[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tipoSensores, setTipoSensores] = useState<TipoSensor[]>([]);
    const [graficos, setGraficos] = useState<Grafico[]>([]);
    const [newSensor, setNewSensor] = useState<Omit<Sensor, 'id'>>({
        nombre: '',
        minimo: '',
        maximo: '',
        codigo: '',
        nombre_grafico: '',
        rango_chart: 0,
        grafico: 0,
        tipo_sensor: 0,
        nombre_tipo_sensor: '',
    });

    useEffect(() => {
        fetchSensores();
        fetchTipoSensores();
        fetchGraficos();
    }, []);

    const fetchSensores = async () => {
        try {
            const response = await ApiRest.get('sensor');
            setSensores(response.data.data);
            setFiltered(response.data.data);
        } catch (error) {
            console.error('Error al cargar sensores:', error);
        }
    };

    const fetchTipoSensores = async () => {
        try {
            const response = await ApiRest.get('tipo_sensor');
            setTipoSensores(response.data.data);
        } catch (error) {
            console.error('Error al cargar tipos de sensores:', error);
        }
    };

    const fetchGraficos = async () => {
        try {
            const response = await ApiRest.post('charts');
            setGraficos(response.data.data);
        } catch (error) {
            console.error('Error al cargar gráficos:', error);
        }
    };

    useEffect(() => {
        const results = sensores.filter(
            (s) =>
                s.nombre.toLowerCase().includes(search.toLowerCase()) ||
                s.codigo.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(results);
        setCurrentPage(1);
    }, [search, sensores]);

    const indexOfLastSensor = currentPage * itemsPerPage;
    const indexOfFirstSensor = indexOfLastSensor - itemsPerPage;
    const currentSensors = filtered.slice(indexOfFirstSensor, indexOfLastSensor);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSensor(prev => ({ ...prev, [name]: name === 'grafico' || name === 'tipo_sensor' ? parseInt(value) : value }));
    };
    const handleDeleteSensor = async (sensorId: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
    
        if (result.isConfirmed) {
            try {
                const response = await ApiRest.post(`delete/${sensorId}`);
                if (response.data.success) {
                    Swal.fire('¡Eliminado!', 'El sensor ha sido eliminado exitosamente.', 'success');
                    fetchSensores(); 
                } else {
                    Swal.fire('Error', 'No se pudo eliminar el sensor.', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar sensor:', error);
                Swal.fire('Error', 'Hubo un problema al intentar eliminar el sensor.', 'error');
            }
        }
    };
    
    
    const handleCreateSensor = async () => {
        try {
            // Validar que los campos necesarios estén completos antes de enviar la solicitud
            if (!newSensor.nombre || !newSensor.minimo || !newSensor.maximo || !newSensor.codigo) {
                toast.error('Por favor, complete todos los campos requeridos.');
                return; // Evita que se haga la solicitud si falta algún dato
            }

            // Enviar los datos al backend
            const response = await ApiRest.post('/add/sensor', newSensor);

            // Verificar si la respuesta es exitosa
            if (response.data.success) {
                // Mostrar el mensaje de éxito en el frontend
                toast.success('Sensor creado exitosamente');

                // Actualizar los sensores en el frontend
                fetchSensores();

                // Cerrar el modal
                closeModal();

                // Limpiar el estado del nuevo sensor
                setNewSensor({
                    nombre: '',
                    minimo: '',
                    maximo: '',
                    codigo: '',
                    nombre_grafico: '',
                    rango_chart: 0,
                    grafico: 1,  // Asegurarse de que el valor predeterminado sea 1
                    tipo_sensor: 0,
                    nombre_tipo_sensor: '',
                });
            } else {
                // Si la respuesta no es exitosa, mostrar un mensaje de error
                toast.error('Error al crear el sensor: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error al crear sensor:', error);
            toast.error('Error al crear sensor');
        }
    };


    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-all duration-300">
            <ToastContainer position="bottom-right" />
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FaMicrochip /> Gestión de Sensores
                </h2>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={openModal}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                        <FaPlus /> Agregar Sensor
                    </button>
                    <div className="relative w-full md:w-64">
                        <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
                        <input
                            type="text"
                            placeholder="Buscar sensor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-left text-sm md:text-base">
                            <th className="p-4"><FaMicrochip className="inline mr-2" />Nombre</th>
                            <th className="p-4"><FaTemperatureLow className="inline mr-2" />Mínimo</th>
                            <th className="p-4"><FaTemperatureHigh className="inline mr-2" />Máximo</th>
                            <th className="p-4"><FaBarcode className="inline mr-2" />Código</th>
                            <th className="p-4"><FaChartLine className="inline mr-2" />Rango Chart</th>
                            <th className="p-4"><FaChartLine className="inline mr-2" />Gráfico</th>
                            <th className="p-4"><FaLayerGroup className="inline mr-2" />Tipo Sensor</th>
                            <th className="p-4"><FaLayerGroup className="inline mr-2" />Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSensors.length > 0 ? (
                            currentSensors.map((sensor) => (
                                <tr key={sensor.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300">
                                    <td className="p-4">{sensor.nombre}</td>
                                    <td className="p-4">{sensor.minimo}</td>
                                    <td className="p-4">{sensor.maximo}</td>
                                    <td className="p-4">{sensor.codigo}</td>
                                    <td className="p-4">{sensor.rango_chart}</td>
                                    <td className="p-4">{sensor.nombre_grafico}</td>
                                    <td className="p-4">{sensor.nombre_tipo_sensor}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDeleteSensor(sensor.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                                        >
                                            Eliminar
                                        </button>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-6 text-center text-gray-500 dark:text-gray-400">
                                    No se encontraron sensores.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(filtered.length / itemsPerPage) }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Modal para agregar sensor */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-11/12 md:w-1/2 mx-auto mt-24"
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Agregar Nuevo Sensor</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="nombre"
                        value={newSensor.nombre}
                        onChange={handleInputChange}
                        placeholder="Nombre"
                        className="border p-2 rounded dark:bg-gray-800 dark:text-white"
                    />
                    <input
                        type="text"
                        name="minimo"
                        value={newSensor.minimo}
                        onChange={handleInputChange}
                        placeholder="Mínimo"
                        className="border p-2 rounded dark:bg-gray-800 dark:text-white"
                    />
                    <input
                        type="text"
                        name="maximo"
                        value={newSensor.maximo}
                        onChange={handleInputChange}
                        placeholder="Máximo"
                        className="border p-2 rounded dark:bg-gray-800 dark:text-white"
                    />
                    <input
                        type="text"
                        name="codigo"
                        value={newSensor.codigo}
                        onChange={handleInputChange}
                        placeholder="Codigo Eje. V1"
                        className="border p-2 rounded dark:bg-gray-800 dark:text-white"
                    />

                    <input
                        type="number"
                        name="rango_chart"
                        value={newSensor.rango_chart}
                        onChange={handleInputChange}
                        placeholder="Rango Chart"
                        className="border p-2 rounded dark:bg-gray-800 dark:text-white"
                    />
                    <select
                        name="grafico"
                        value={newSensor.grafico}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Seleccione un gráfico</option>
                        {graficos.map((grafico) => (
                            <option key={grafico.id} value={grafico.id}>
                                {grafico.nombre}
                            </option>
                        ))}
                    </select>


                    <select
                        name="tipo_sensor"
                        value={newSensor.tipo_sensor}
                        onChange={handleInputChange}
                        className="border p-2 rounded dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Seleccione Tipo Sensor</option>
                        {tipoSensores.map(t => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                    </select>
                </div>
                {newSensor.grafico !== 0 && (
                    <div className="flex justify-end gap-4 mt-6">
                        <p className="text-gray-700 dark:text-gray-300 mb-2">Vista previa del gráfico:</p>
                        <img
                            src={`${ApiConfig.api_img}/${graficos.find(g => g.id === newSensor.grafico)?.img}`}
                            alt="Vista previa"
                            className="w-64 h-40 object-contain border rounded shadow-md"
                        />
                    </div>
                )}
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreateSensor}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                        Guardar sensor
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SensoresPage;
