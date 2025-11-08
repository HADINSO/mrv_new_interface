import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Button from "../ui/button/Button";
import toast from "react-hot-toast";

export default function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { ruta } = useParams<{ ruta: string }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rutaDecodificada = ruta ? decodeURIComponent(ruta) : "/";

    setLoading(true);
    try {
      await login(username, password);
      toast.success("Inicio de sesión exitoso 🎉");
      navigate(rutaDecodificada);
    } catch {
      toast.error("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Volver */}
      <div className="w-full max-w-md mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-green-700 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Volver a la app
        </Link>
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 sm:p-12 transition-transform duration-300 hover:scale-[1.01]">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Iniciar sesión
          </h1>

          <img
            src="/images/IconGeo.png"
            alt="Icono"
            className="w-28 h-28 mx-auto mb-4 drop-shadow-md"
          />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¡Introduce tus credenciales para continuar!
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Correo */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">
              Correo electrónico <span className="text-green-600">*</span>
            </Label>
            <Input
              placeholder="info@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>

          {/* Contraseña */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">
              Contraseña <span className="text-green-600">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors"
              >
                {showPassword ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <EyeCloseIcon className="w-5 h-5" />
                )}
              </span>
            </div>
          </div>

          {/* Botón */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold rounded-xl bg-green-600 text-white shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
              size="sm"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Acceder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
