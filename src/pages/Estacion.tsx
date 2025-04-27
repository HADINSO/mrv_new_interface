import { useState, useRef, useEffect } from "react";

import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import { EstacionManager } from "./Estacion/EstacionManager";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const Estacion: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  useEffect(() => {
    setEvents([
      {
        id: "1",
        title: "Event Conf.",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { calendar: "Danger" },
      },
      {
        id: "2",
        title: "Meeting",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { calendar: "Success" },
      },
      {
        id: "3",
        title: "Workshop",
        start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        extendedProps: { calendar: "Primary" },
      },
    ]);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { calendar: eventLevel },
              }
            : event
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta
        title="Estaciones & Sensores"
        description="Gestión y administración de estaciones y sensores."
      />
      <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-dark-800 dark:border-gray-700">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Estaciones</h1>
          <button
            onClick={openModal}
            className="mt-4 md:mt-0 inline-flex items-center px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition dark:bg-brand-400 dark:hover:bg-brand-500"
          >
            + Agregar Estación
          </button>
        </div>

        {/* Contenido */}
        <div className="bg-white dark:bg-dark-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm">
          <EstacionManager />
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 dark:text-white text-xl lg:text-2xl">
              {selectedEvent ? "Editar Evento" : "Agregar Evento"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Programa tu próximo gran momento: agenda o edita un evento para mantenerte en curso.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Título */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">Título del Evento</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-dark-900 dark:text-white/90"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">Color del Evento</label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(calendarsEvents).map(([key, value]) => (
                  <label key={key} className="flex items-center text-sm text-gray-700 dark:text-gray-400">
                    <input
                      type="radio"
                      name="event-level"
                      value={key}
                      checked={eventLevel === key}
                      onChange={() => setEventLevel(key)}
                      className="hidden"
                    />
                    <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-400 rounded-full cursor-pointer dark:border-gray-600">
                      <span className={`h-3 w-3 rounded-full ${eventLevel === key ? "bg-brand-500" : ""}`}></span>
                    </span>
                    {key}
                  </label>
                ))}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">Fecha de Inicio</label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-dark-900 dark:text-white/90"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">Fecha de Fin</label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-dark-900 dark:text-white/90"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 mt-8 justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-dark-800 dark:text-gray-300 dark:hover:bg-dark-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              type="button"
              className="px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-500"
            >
              {selectedEvent ? "Actualizar" : "Agregar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Estacion;
