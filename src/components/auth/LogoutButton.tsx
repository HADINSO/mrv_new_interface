import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin"); // o la ruta que desees
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <FiLogOut size={20} />
    </button>
  );
};
