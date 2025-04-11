import PageMeta from "../../components/common/PageMeta";
import MapComponent from "./Mapa";

export default function Maps() {
  return (
    <>
      <PageMeta
        title="mrv monitor"
        description="sistema ambiental"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 h-[80vh]">
          <MapComponent />
        </div>
      </div>
    </>
  );
}
