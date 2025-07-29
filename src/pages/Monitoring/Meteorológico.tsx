// @ts-nocheck
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "../../components/charts/highcharts/MonthlyTarget";
import RainfallChart from "../../components/charts/highcharts/StatisticsChart";
import EnvironmentalMetrics2 from "../../components/ecommerce/EcommerceMetrics2";

interface Estacion {
    id: number;
    nombre: string;
    descripcion: string;
    lat: string;
    lng: string;
    id_tipo_estacion: number;
    tipo_estacion_nombre: string;
    estacion_mrv: number;
}

type Props = {
    estacion: Estacion;
};

export const Meteorológico = ({ estacion }: Props) => {


    const idEstacion = estacion.estacion_mrv > 0 ? estacion.estacion_mrv : estacion.id;


    return (
        <>
            <PageMeta
                title="Monitoreo"
                description="Monitoreo de la estación."
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-7">
                    <EcommerceMetrics estacion={idEstacion} />
                    <EnvironmentalMetrics2 estacion={idEstacion} />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <MonthlyTarget estacion={idEstacion} />
                </div>

                <div className="col-span-12">
                    <RainfallChart estacion={idEstacion} />
                </div>
            </div>
        </>
    );
};
