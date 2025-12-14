import { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import AccountValidation from "./AccountValidation";
import Helper from "../../service/Helper";

interface SignUpData {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpForm() {
  const [form, setForm] = useState<SignUpData>({
    nombre: "",
    apellido: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- LÓGICA SIN CAMBIOS ---------- */

  const validateForm = () => {
    if (!form.nombre || !form.apellido || !form.username) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return false;
    }
    if (!form.email.includes("@")) {
      Swal.fire("Error", "Email no válido", "error");
      return false;
    }
    if (form.password.length < 6) {
      Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres", "error");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return false;
    }
    if (!isChecked) {
      Swal.fire("Error", "Debes aceptar los términos y condiciones", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const searchResponse = await fetch(
        `${Helper.url}auth/SignUp/search/mail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email: form.email }),
        }
      );

      const searchData = await searchResponse.json();

      if (searchData.existe) {
        Swal.fire("Error", "El email ya está registrado", "error");
        setLoading(false);
        return;
      }

      const signUpResponse = await fetch(
        "https://api.helsy.com.co/SignUp.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            nombre: form.nombre,
            apellido: form.apellido,
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        }
      );

      if (signUpResponse.ok) {
        Swal.fire("¡Cuenta creada!", "Revisa tu correo para validar la cuenta", "success");
        setEnviado(true);
      }
    } catch {
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) return <AccountValidation />;

  return (
    <div className="flex flex-col justify-center flex-1 w-full lg:w-1/2 px-6">
      {/* Volver */}
      <div className="w-full max-w-md mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition"
        >
          <ChevronLeftIcon className="size-5" />
          Volver
        </Link>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Crear cuenta
          </h1>
          <p className="text-sm text-gray-500">
            Únete y comienza tu experiencia hoy
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nombre</Label>
            <Input name="nombre" onChange={handleChange} />
          </div>
          <div>
            <Label>Apellido</Label>
            <Input name="apellido" onChange={handleChange} />
          </div>
        </div>

        <div>
          <Label>Usuario</Label>
          <Input name="username" onChange={handleChange} />
        </div>

        <div>
          <Label>Email</Label>
          <Input type="email" name="email" onChange={handleChange} />
        </div>

        <div>
          <Label>Contraseña</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition"
            >
              {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
            </button>
          </div>
        </div>

        <div>
          <Label>Confirmar contraseña</Label>
          <Input type="password" name="confirmPassword" onChange={handleChange} />
        </div>

        {/* Términos */}
        <div className="flex items-start gap-2">
          <Checkbox checked={isChecked} onChange={setIsChecked} />
          <span className="text-sm text-gray-600">
            Acepto los{" "}
            <span className="text-green-600 font-medium cursor-pointer">
              términos y condiciones
            </span>
          </span>
        </div>

        {/* Botón */}
        <button
          disabled={loading}
          className="
            w-full py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r from-green-600 via-green-500 to-blue-600
            hover:from-green-700 hover:to-blue-700
            transition-all duration-300
            disabled:opacity-60
            shadow-lg
          "
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/signin"
            className="text-green-600 font-semibold hover:text-blue-600 transition"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
