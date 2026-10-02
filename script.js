/* =========================
   DATA
========================= */

const SUPABASE_URL = "https://fviqworvxosnbwbddnjp.supabase.co";
const SUPABASE_KEY = "sb_publishable_WQ73kA57RHRjmwqZTrE8dA_iNfysoPc";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let events = [];


/* =========================
   CALENDAR STATE
========================= */

const today = new Date();

let currentMonth = today.getMonth();

let currentYear = today.getFullYear();


/* =========================
   ADD ACTIVITY
========================= */

function addEvent() {

  const activityType =
    document.getElementById("activityType").value;

  const activityName =
    document.getElementById("activityName").value.trim();

  const participant =
    document.getElementById("participant").value.trim();

  const directorHost =
    document.getElementById("directorHost").value.trim();

  const startDate =
    document.getElementById("startDate").value;

  const endDate =
    document.getElementById("endDate").value;

  const time =
    document.getElementById("time").value;

  const eventActivity =
    document.getElementById("event").value.trim();

  const destination =
    document.getElementById("destination").value.trim();

  const hotel =
    document.getElementById("hotel").value.trim();

  const flight =
    document.getElementById("flight").value.trim();

  const status =
    document.getElementById("status").value;

  const notes =
    document.getElementById("notes").value.trim();


  if (!activityName || !startDate) {

    alert(
      "Please complete Activity / Trip Name and Start Date."
    );

    return;
  }


  if (endDate && endDate < startDate) {

    alert(
      "End Date cannot be before Start Date."
    );

    return;
  }


  const newEvent = {

    activityType,
    activityName,
    participant,
    directorHost,
    startDate,
    endDate,
    time,
    eventActivity,
    destination,
    hotel,
    flight,
    status,
    notes

  };


  events.push(newEvent);

  saveEvents();

  displayEvents();

  renderCalendar();

  clearForm();

}


/* =========================
   SAVE
========================= */

async function saveEvents() {

  const item = events[events.length - 1];

  const { error } = await supabaseClient
    .from("activities")
    .insert({
      activity_type: item.activityType,
      activity_name: item.activityName,
      participant: item.participant,
      director_host: item.directorHost,
      start_date: item.startDate,
      end_date: item.endDate || null,
      time: item.time,
      event_activity: item.eventActivity,
      destination: item.destination,
      hotel: item.hotel,
      flight: item.flight,
      status: item.status,
      notes: item.notes
    });

  if (error) {
    console.error(error);
    alert("Could not save the activity.");
  }

}


/* =========================
   DISPLAY LIST
========================= */

function displayEvents() {

  const eventsList =
    document.getElementById("eventsList");

  const eventCount =
    document.getElementById("eventCount");


  if (!eventsList) {
    return;
  }


  if (eventCount) {

    const number = events.length;

    eventCount.textContent =
      number === 1
        ? "1 activity"
        : `${number} activities`;

  }


  if (events.length === 0) {

    eventsList.innerHTML = `

      <div class="empty-message">

        No activities added yet.

      </div>

    `;

    return;
  }


  eventsList.innerHTML = "";


  const sortedEvents =
    [...events].sort(function(a, b) {

      return a.startDate.localeCompare(
        b.startDate
      );

    });


  sortedEvents.forEach(function(item) {

    const originalIndex =
      events.indexOf(item);


    const eventCard =
      document.createElement("div");

    eventCard.className =
      "event-card";


    eventCard.innerHTML = `

      <div class="event-header">

        <div>

          <span class="activity-type">
            ${escapeHtml(item.activityType)}
          </span>

          <h3>
            ${escapeHtml(item.activityName)}
          </h3>

          <p class="participant">
            ${escapeHtml(
              item.participant ||
              "No participant specified"
            )}
          </p>

        </div>


        <span class="status ${getStatusClass(item.status)}">

          ${escapeHtml(item.status)}

        </span>

      </div>


      <div class="event-details">

        <p>
          <strong>Director Name / UJV Host:</strong>
          ${escapeHtml(item.directorHost || "—")}
        </p>


        <p>
          <strong>Start Date:</strong>
          ${formatDate(item.startDate)}
        </p>


        <p>
          <strong>End Date:</strong>
          ${
            item.endDate
              ? formatDate(item.endDate)
              : "—"
          }
        </p>


        <p>
          <strong>Time:</strong>
          ${escapeHtml(item.time || "—")}
        </p>


        <p>
          <strong>Event / Activity:</strong>
          ${escapeHtml(item.eventActivity || "—")}
        </p>


        <p>
          <strong>Destination:</strong>
          ${escapeHtml(item.destination || "—")}
        </p>


        <p>
          <strong>Hotel / Property:</strong>
          ${escapeHtml(item.hotel || "—")}
        </p>


        <p>
          <strong>Flight Information:</strong>
          ${escapeHtml(item.flight || "—")}
        </p>


        <p>
          <strong>Notes:</strong>
          ${escapeHtml(item.notes || "—")}
        </p>

      </div>


      <button
        class="delete-button"
        data-index="${originalIndex}">

        Delete

      </button>

    `;


    const deleteButton =
      eventCard.querySelector(".delete-button");


    deleteButton.addEventListener(
      "click",
      function() {

        deleteEvent(originalIndex);

      }
    );


    eventsList.appendChild(eventCard);

  });

}


/* =========================
   DELETE
========================= */

function deleteEvent(index) {

  const confirmation =
    confirm(
      "Are you sure you want to delete this activity?"
    );


  if (!confirmation) {
    return;
  }


  events.splice(index, 1);

  saveEvents();

  displayEvents();

  renderCalendar();

}


/* =========================
   CLEAR FORM
========================= */

function clearForm() {

  document.getElementById("activityName").value = "";

  document.getElementById("participant").value = "";

  document.getElementById("directorHost").value = "";

  document.getElementById("startDate").value = "";

  document.getElementById("endDate").value = "";

  document.getElementById("time").value = "";

  document.getElementById("event").value = "";

  document.getElementById("destination").value = "";

  document.getElementById("hotel").value = "";

  document.getElementById("flight").value = "";

  document.getElementById("status").value =
    "Confirmed";

  document.getElementById("notes").value = "";

}


/* =========================
   DATE FORMAT
========================= */

function formatDate(date) {

  if (!date) {
    return "—";
  }


  const parts =
    date.split("-");


  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const day =
    Number(parts[2]);


  const formattedDate =
    new Date(
      year,
      month - 1,
      day
    );


  return formattedDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );

}


/* =========================
   DATE KEY
========================= */

function dateKey(year, month, day) {

  return (
    year +
    "-" +
    String(month + 1).padStart(2, "0") +
    "-" +
    String(day).padStart(2, "0")
  );

}


/* =========================
   ACTIVITY ON DATE
========================= */

function eventOccursOnDate(item, dateString) {

  if (!item.startDate) {
    return false;
  }


  const start =
    item.startDate;

  const end =
    item.endDate || item.startDate;


  return (
    dateString >= start &&
    dateString <= end
  );

}


/* =========================
   CALENDAR
========================= */

function renderCalendar() {

  const calendarGrid =
    document.getElementById("calendarGrid");

  const calendarMonth =
    document.getElementById("calendarMonth");


  if (!calendarGrid) {
    return;
  }


  const monthName =
    new Date(
      currentYear,
      currentMonth,
      1
    ).toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric"
      }
    );


  calendarMonth.textContent =
    monthName;


  calendarGrid.innerHTML = "";


  const firstDay =
    new Date(
      currentYear,
      currentMonth,
      1
    );


  const daysInMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();


  let startingDay =
    firstDay.getDay();


  /*
    JavaScript:
    Sunday = 0
    Monday = 1

    We want Monday as first day.
  */

  startingDay =
    startingDay === 0
      ? 6
      : startingDay - 1;


  const previousMonthDays =
    new Date(
      currentYear,
      currentMonth,
      0
    ).getDate();


  /*
    Previous month days
  */

  for (
    let i = startingDay - 1;
    i >= 0;
    i--
  ) {

    const dayNumber =
      previousMonthDays - i;


    const previousMonth =
      currentMonth === 0
        ? 11
        : currentMonth - 1;


    const previousYear =
      currentMonth === 0
        ? currentYear - 1
        : currentYear;


    createCalendarDay(
      dayNumber,
      previousMonth,
      previousYear,
      true
    );

  }


  /*
    Current month
  */

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    createCalendarDay(
      day,
      currentMonth,
      currentYear,
      false
    );

  }


  /*
    Next month days
  */

  const totalCells =
    startingDay + daysInMonth;


  const remainingCells =
    totalCells % 7 === 0
      ? 0
      : 7 - (totalCells % 7);


  for (
    let day = 1;
    day <= remainingCells;
    day++
  ) {

    const nextMonth =
      currentMonth === 11
        ? 0
        : currentMonth + 1;


    const nextYear =
      currentMonth === 11
        ? currentYear + 1
        : currentYear;


    createCalendarDay(
      day,
      nextMonth,
      nextYear,
      true
    );

  }

}


/* =========================
   CREATE CALENDAR DAY
========================= */

function createCalendarDay(
  day,
  month,
  year,
  otherMonth
) {

  const calendarGrid =
    document.getElementById(
      "calendarGrid"
    );


  const dayElement =
    document.createElement("div");


  dayElement.className =
    "calendar-day";


  if (otherMonth) {

    dayElement.classList.add(
      "other-month"
    );

  }


  const key =
    dateKey(
      year,
      month,
      day
    );


  const todayKey =
    dateKey(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );


  if (key === todayKey) {

    dayElement.classList.add(
      "today"
    );

  }


  dayElement.innerHTML = `

    <div class="day-number">
      ${day}
    </div>

  `;


  const dayEvents =
    events.filter(function(item) {

      return eventOccursOnDate(
        item,
        key
      );

    });


  /*
    Show up to 3 activities
  */

  const visibleEvents =
    dayEvents.slice(0, 3);


  visibleEvents.forEach(function(item) {

    const eventButton =
      document.createElement("button");


    eventButton.type =
      "button";


    eventButton.className =
      "calendar-event";


    eventButton.innerHTML = `

      <span class="event-type">

        ${escapeHtml(item.activityType)}

      </span>

      <strong>

        ${escapeHtml(item.activityName)}

      </strong>

      ${
        item.time
          ? `<span>${escapeHtml(item.time)}</span>`
          : ""
      }

    `;


    eventButton.addEventListener(
      "click",
      function() {

        showSelectedActivity(
          item,
          key
        );

      }
    );


    dayElement.appendChild(
      eventButton
    );

  });


  if (dayEvents.length > 3) {

    const more =
      document.createElement("div");


    more.className =
      "more-events";


    more.textContent =
      `+ ${dayEvents.length - 3} more`;


    dayElement.appendChild(
      more
    );

  }


  calendarGrid.appendChild(
    dayElement
  );

}


/* =========================
   SELECTED ACTIVITY
========================= */

function showSelectedActivity(
  item,
  date
) {

  const selectedDay =
    document.getElementById(
      "selectedDay"
    );


  selectedDay.innerHTML = `

    <div class="selected-day-box">

      <h3>
        ${formatDate(date)}
      </h3>


      <div class="selected-detail">

        <strong>Activity:</strong>

        ${escapeHtml(item.activityName)}

      </div>


      <div class="selected-detail">

        <strong>Activity Type:</strong>

        ${escapeHtml(item.activityType)}

      </div>


      <div class="selected-detail">

        <strong>Participant:</strong>

        ${escapeHtml(
          item.participant || "—"
        )}

      </div>


      <div class="selected-detail">

        <strong>Director / UJV Host:</strong>

        ${escapeHtml(
          item.directorHost || "—"
        )}

      </div>


      <div class="selected-detail">

        <strong>Event / Activity:</strong>

        ${escapeHtml(
          item.eventActivity || "—"
        )}

      </div>


      <div class="selected-detail">

        <strong>Destination:</strong>

        ${escapeHtml(
          item.destination || "—"
        )}

      </div>


      <div class="selected-detail">

        <strong>Hotel / Property:</strong>

        ${escapeHtml(
          item.hotel || "—"
        )}

      </div>


      <div class="selected-detail">

        <strong>Flight:</strong>

        ${escapeHtml(
          item.flight || "—"
        )}

      </div>


      <div class="selected-detail">

        <strong>Status:</strong>

        ${escapeHtml(
          item.status || "—"
        )}

      </div>


      <div class="selected-detail">

        <strong>Notes:</strong>

        ${escapeHtml(
          item.notes || "—"
        )}

      </div>

    </div>

  `;


  selectedDay.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });

}


/* =========================
   MONTH NAVIGATION
========================= */

function changeMonth(amount) {

  currentMonth += amount;


  if (currentMonth > 11) {

    currentMonth = 0;

    currentYear++;

  }


  if (currentMonth < 0) {

    currentMonth = 11;

    currentYear--;

  }


  renderCalendar();

}


/* =========================
   TODAY
========================= */

function goToToday() {

  currentMonth =
    today.getMonth();

  currentYear =
    today.getFullYear();


  renderCalendar();

}


/* =========================
   STATUS CLASS
========================= */

function getStatusClass(status) {

  if (!status) {
    return "";
  }


  return status
    .toLowerCase()
    .replace(/\s+/g, "-");

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================
   VIEW SWITCHING
========================= */

function showCalendarView() {
async function loadEvents() {

  const { data, error } = await supabaseClient
    .from("activities")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  events = data.map(function(item) {

    return {
      activityType: item.activity_type,
      activityName: item.activity_name,
      participant: item.participant,
      directorHost: item.director_host,
      startDate: item.start_date,
      endDate: item.end_date,
      time: item.time,
      eventActivity: item.event_activity,
      destination: item.destination,
      hotel: item.hotel,
      flight: item.flight,
      status: item.status,
      notes: item.notes
    };

  });

  displayEvents();
  renderCalendar();

}

loadEvents();
  document
    .getElementById("calendarSection")
    .style.display = "block";


  document
    .getElementById("listSection")
    .style.display = "none";


  document
    .getElementById("calendarViewButton")
    .classList.add("active");


  document
    .getElementById("listViewButton")
    .classList.remove("active");

}


function showListView() {

  document
    .getElementById("calendarSection")
    .style.display = "none";


  document
    .getElementById("listSection")
    .style.display = "block";


  document
    .getElementById("calendarViewButton")
    .classList.remove("active");


  document
    .getElementById("listViewButton")
    .classList.add("active");

}


/* =========================
   BUTTONS
========================= */

const addEventButton =
  document.getElementById(
    "addEventButton"
  );


if (addEventButton) {

  addEventButton.addEventListener(
    "click",
    addEvent
  );

}


document
  .getElementById("previousMonth")
  .addEventListener(
    "click",
    function() {

      changeMonth(-1);

    }
  );


document
  .getElementById("nextMonth")
  .addEventListener(
    "click",
    function() {

      changeMonth(1);

    }
  );


document
  .getElementById("todayButton")
  .addEventListener(
    "click",
    goToToday
  );


document
  .getElementById("calendarViewButton")
  .addEventListener(
    "click",
    showCalendarView
  );


document
  .getElementById("listViewButton")
  .addEventListener(
    "click",
    showListView
  );


/* =========================
   INITIAL LOAD
========================= */
showCalendarView();
