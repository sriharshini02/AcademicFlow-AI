import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CalendarView = ({ appointments }) => {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  const events = appointments
    .filter((a) => a.scheduled_time)
    .map((a) => ({
      id: a.visit_id,
      title: `${a.purpose} (${a.action_taken})`,
      start: new Date(a.scheduled_time),
      end: new Date(new Date(a.scheduled_time).getTime() + 30 * 60 * 1000),
      allDay: false,
      resource: a,
    }));

  const eventStyleGetter = (event) => {
    let bg = "#93c5fd"; // blue
    if (event.resource.action_taken === "Completed") bg = "#86efac"; // green
    else if (event.resource.action_taken === "Cancelled") bg = "#fca5a5"; // red
    else if (event.resource.action_taken === "Pending") bg = "#fde68a"; // yellow
    return { style: { backgroundColor: bg, borderRadius: "8px", color: "#1f2937" } };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        popup
        views={["month", "week", "day", "agenda"]}
        view={view}
        date={date}
        onView={(v) => setView(v)}
        onNavigate={(d) => setDate(d)}
        defaultView="month"
        toolbar={true}
      />
    </div>
  );
};

export default CalendarView;
