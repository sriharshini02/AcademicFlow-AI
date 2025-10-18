// src/components/CalendarView.jsx
import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarView = ({ appointments }) => {
  const events = appointments
    .filter((a) => a.scheduled_time) // only show those with a date
    .map((a) => ({
      id: a.visit_id,
      title: `${a.purpose} (${a.action_taken})`,
      start: new Date(a.scheduled_time),
      end: new Date(new Date(a.scheduled_time).getTime() + 30 * 60 * 1000), // assume 30min slot
      allDay: false,
      resource: a,
    }));

  const eventStyleGetter = (event) => {
    let bg = "#93c5fd"; // default blue
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
      />
    </div>
  );
};

export default CalendarView;
