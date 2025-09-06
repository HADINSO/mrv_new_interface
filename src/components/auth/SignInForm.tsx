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

    const rutaDecodificada = ruta
      ? decodeURIComponent(ruta)
      : "/";

    setLoading(true);
    try {
      await login(username, password);
      toast.success("Inicio de sesión exitoso 🎉");
      if (rutaDecodificada === "/") {
        navigate("/");
      } else {
        navigate(rutaDecodificada);
      }

    } catch (err) {
      toast.error("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      {/* Volver */}
      <div className="w-full max-w-md mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Volver a la app
        </Link>
      </div>

      {/* Formulario */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white sm:text-3xl">
            Iniciar sesión
          </h1>

          {/* Imagen centrada y con tamaño controlado */}
          <img
            src="/images/IconGeo.png"
            alt="Icono"
            className="w-30 h-30 mx-auto mb-3 sm:w-30 sm:h-30"
          />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¡Introduce tu correo y contraseña para iniciar sesión!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Correo */}
          <div>
            <Label>
              Correo electrónico <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="info@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Contraseña */}
          <div>
            <Label>
              Contraseña <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          {/* Botón */}
          <div>
            <Button type="submit" className="w-full" size="sm" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Acceder"}
            </Button>
          </div>
        </form>

        {/* Registro
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Crear una
            </Link>
          </p>
        </div>
         */}
      </div>
    </div>
  );
}
