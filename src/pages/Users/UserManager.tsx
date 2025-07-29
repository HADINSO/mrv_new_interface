import React, { useEffect, useState } from 'react';
import { FaTrash, FaBan } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast, ToastContainer } from 'react-toastify';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'react-toastify/dist/ReactToastify.css';
import ApiHelsy from '../../service/ApiHelsy';


const MySwal = withReactContent(Swal);

type User = {
  id: number;
  nombre: string;
  nombreUsuario: string;
  email: string;
  rol: number; // 1: Admin, 2: Cliente, 3: Usuario
  estado: number;
};

const ITEMS_PER_PAGE = 10;

const UserManager: React.FC = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const response = await ApiHelsy.post('users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error al cargar los usuarios');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id: number) => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        toast.success('Usuario eliminado');
      }
    });
  };

  const handleBlock = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, estado: user.estado === 2 ? 1 : 2 } : user
      )
    );
    toast.info('Estado del usuario actualizado');
  };

  const handleToggleRole = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              rol: user.rol === 1 ? 2 : user.rol === 2 ? 3 : 1,
            }
          : user
      )
    );
    toast.success('Rol del usuario actualizado');
  };

  const getRolName = (rol: number) => {
    if (rol === 1) return 'Administrador';
    if (rol === 2) return 'Usuario';
    return 'Usuario';
  };

  const getNextRolLabel = (rol: number) => {
    if (rol === 1) return '➡ Usuario';
    if (rol === 2) return '➡ Cliente';
    return '➡ Admin';
  };

  const filteredUsers = users.filter((user) =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="max-w-7xl mx-auto p-4 transition duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Gestión de Usuarios</h2>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <p className="text-gray-600 dark:text-gray-300">
          Total usuarios: <strong>{filteredUsers.length}</strong>
        </p>
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o email"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-3 py-1 w-full max-w-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-auto rounded-lg shadow border dark:border-gray-600">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm dark:bg-gray-900 dark:divide-gray-600">
          <thead className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Usuario</th>
              <th className="text-left p-3">Correo</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-center p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr key={user.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="p-3">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td className="p-3">{user.nombre}</td>
                <td className="p-3">{user.nombreUsuario}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{getRolName(user.rol)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.estado === 1
                      ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                      : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                  }`}>
                    {user.estado === 1 ? 'Activo' : 'Bloqueado'}
                  </span>
                </td>
                <td className="p-3 text-center flex justify-center gap-2 flex-wrap">
                  <button onClick={() => handleBlock(user.id)} className="text-yellow-500 hover:text-yellow-700" title="Bloquear/Desbloquear">
                    <FaBan />
                  </button>
                  <button onClick={() => handleToggleRole(user.id)} className="text-blue-500 hover:text-blue-700 text-xs" title="Cambiar Rol">
                    {getNextRolLabel(user.rol)}
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700" title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden grid gap-4 mt-4">
        {paginatedUsers.map((user, index) => (
          <div key={index} className="border rounded-lg p-4 shadow dark:bg-gray-800 dark:border-gray-600">
            <p className="font-bold text-lg dark:text-white">{user.nombre}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Usuario: {user.nombreUsuario}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Correo: {user.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Rol: {getRolName(user.rol)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Estado:{' '}
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                user.estado === 1
                  ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                  : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
              }`}>
                {user.estado === 1 ? 'Activo' : 'Bloqueado'}
              </span>
            </p>
            <div className="flex gap-4 mt-2 flex-wrap">
              <button onClick={() => handleBlock(user.id)} className="text-yellow-500 hover:text-yellow-700">
                <FaBan />
              </button>
              <button onClick={() => handleToggleRole(user.id)} className="text-blue-500 hover:text-blue-700 text-xs">
                {getNextRolLabel(user.rol)}
              </button>
              <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 dark:bg-gray-700 dark:text-white"
        >
          Anterior
        </button>
        <span className="dark:text-white">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 dark:bg-gray-700 dark:text-white"
        >
          Siguiente
        </button>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default UserManager;
