import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Páginas públicas
import Maps from "./pages/Maps/Maps";
import Home from "./pages/Dashboard/Home";

// Autenticación
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

// Layout y utilidades
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import NotFound from "./pages/OtherPage/NotFound";

// Páginas privadas
import { Monitoreo } from "./pages/Monitoring/Monitoreo";
import Variables from "./pages/Variables/Variables";
import Detalles from "./pages/Variables/Detalles";
import Users from "./pages/Users/Users";
import Visits from "./pages/Visits/Visits";
import Estacion from "./pages/Estacion";
import SensoresPage from "./pages/Sensor";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";

// UI y tablas
import FormElements from "./pages/Forms/FormElements";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";

// Contexto de autenticación
import { useAuth } from "./context/AuthContext";
import Comunas from "./pages/Comunas/Comunas";
import Precios from "./pages/Precios/Precios";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Rutas con layout principal */}
        <Route element={<AppLayout />}>
          {/* 🌐 Públicas */}
          <Route index element={<Maps />} />
          <Route path="/inform" element={<Home />} />
          <Route path="/inform/:estacion" element={<Home />} />
          <Route path="/monitoring/:id" element={<Monitoreo />} />
          <Route path="/monitoring/variables/:id" element={<Variables />} />
          <Route path="/monitoring/variables/detalles/:codigo/:id" element={<Detalles />}/>
          {/* Privadas (solo si está autenticado) */}
          {isAuthenticated && (
            <>
              <Route path="/comunas" element={<Comunas />} />
              <Route path="/precios" element={<Precios />} />
              <Route path="/users" element={<Users />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/stations" element={<Estacion />} />
              <Route path="/sensors" element={<SensoresPage />} />
              <Route path="/visits" element={<Visits />} />
              <Route path="/blank" element={<Blank />} />

              {/* UI, tablas y formularios */}
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/basic-tables" element={<BasicTables />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </>
          )}
        </Route>

        {/* 🔐 Rutas de autenticación */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signin/:ruta" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
