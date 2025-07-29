import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FiChevronLeft,
    FiChevronRight,
    FiSmartphone,
    FiCalendar,
    FiHash,
    FiSearch,
    FiRefreshCcw,
} from "react-icons/fi";

interface Visita {
    id: number;
    dispositivo: string;
    fecha: string;
}

const VisitasTable: React.FC = () => {
    const [visitas, setVisitas] = useState<Visita[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [visitasPerPage] = useState(10);
    const [filtro, setFiltro] = useState("");
    const [loading, setLoading] = useState(true);

    // Función para obtener visitas y ordenarlas por fecha descendente
    const fetchVisitas = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Visita[]>("https://api.helsy.com.co/api/visitas");

            const dataOrdenada = response.data.sort(
                (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            setVisitas(dataOrdenada);
        } catch (error) {
            console.error("Error al obtener las visitas:", error);
        } finally {
            setLoading(false);
        }
    };

    // Primera carga y actualización cada 30 segundos
    useEffect(() => {
        fetchVisitas();
        const intervalo = setInterval(fetchVisitas, 30000);
        return () => clearInterval(intervalo);
    }, []);

    const visitasFiltradas = visitas.filter((v) =>
        v.dispositivo.toLowerCase().includes(filtro.toLowerCase())
    );

    const indexOfLastVisita = currentPage * visitasPerPage;
    const indexOfFirstVisita = indexOfLastVisita - visitasPerPage;
    const currentVisitas = visitasFiltradas.slice(indexOfFirstVisita, indexOfLastVisita);
    const totalPages = Math.ceil(visitasFiltradas.length / visitasPerPage);

    return (
        <div className="p-4 max-w-7xl mx-auto transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <FiSmartphone /> Visitas de: <span className="text-sm sm:text-base">mrvmonitor.com</span>
                </h2>
                <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                    <FiHash /> Total registros: {visitasFiltradas.length}
                    <button
                        onClick={fetchVisitas}
                        className="ml-2 px-2 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition flex items-center gap-1 text-xs"
                    >
                        <FiRefreshCcw className="animate-spin-slow" /> Actualizar
                    </button>
                </div>
            </div>

            <div className="mb-4 relative">
                <FiSearch className="absolute top-3 left-3 text-gray-500 dark:text-gray-400" />
                <input
                    type="text"
                    placeholder="Filtrar por dispositivo..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filtro}
                    onChange={(e) => {
                        setFiltro(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <table className="min-w-full text-sm text-left bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                            <thead className="bg-indigo-50 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-semibold">
                                <tr>
                                    <th className="px-4 py-2 border whitespace-nowrap">
                                        <div className="flex items-center gap-1"><FiHash /> #</div>
                                    </th>
                                    <th className="px-4 py-2 border whitespace-nowrap">
                                        <div className="flex items-center gap-1"><FiSmartphone /> Dispositivo</div>
                                    </th>
                                    <th className="px-4 py-2 border whitespace-nowrap hidden sm:table-cell">
                                        <div className="flex items-center gap-1"><FiCalendar /> Fecha</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentVisitas.length > 0 ? (
                                    currentVisitas.map((visita, index) => (
                                        <tr
                                            key={visita.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            <td className="px-4 py-2 border text-center">
                                                {indexOfFirstVisita + index + 1}
                                            </td>
                                            <td className="px-4 py-2 border break-words max-w-[250px]">
                                                {visita.dispositivo}
                                            </td>
                                            <td className="px-4 py-2 border hidden sm:table-cell">
                                                {new Date(visita.fecha).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No se encontraron resultados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-3 text-sm">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                        >
                            <FiChevronLeft className="mr-1" /> Anterior
                        </button>

                        <span className="text-gray-600 dark:text-gray-300 text-center">
                            Página {currentPage} de {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center justify-center px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                        >
                            Siguiente <FiChevronRight className="ml-1" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default VisitasTable;
