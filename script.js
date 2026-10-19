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

let editingEventId = null;

let editingOriginalEvent = null;

 

 

/* =========================

   CALENDAR STATE

========================= */

 

const today = new Date();

 

let currentMonth = today.getMonth();

 

let currentYear = today.getFullYear();

 

 

/* =========================

   ADD ACTIVITY

========================= */

 

async function addEvent() {

  const activity = {

    activityType: document.getElementById("activityType").value,

    activityName: document.getElementById("activityName").value.trim(),

    participant: document.getElementById("participant").value.trim(),

    directorHost: document.getElementById("directorHost").value.trim(),

    startDate: document.getElementById("startDate").value,

    endDate: document.getElementById("endDate").value,

    time: document.getElementById("time").value,

    eventActivity: document.getElementById("event").value.trim(),

    destination: document.getElementById("destination").value.trim(),

    hotel: document.getElementById("hotel").value.trim(),

    flight: document.getElementById("flight").value.trim(),

    status: document.getElementById("status").value,

    notes: document.getElementById("notes").value.trim()

  };

 

  if (!activity.activityName || !activity.startDate) {

    alert("Please complete Activity / Trip Name and Start Date.");

    return;

  }

  if (activity.endDate && activity.endDate < activity.startDate) {

    alert("End Date cannot be before Start Date.");

    return;

  }

 

  const dbActivity = {

    activity_type: activity.activityType,

    activity_name: activity.activityName,

    participant: activity.participant || null,

    director_host: activity.directorHost || null,

    start_date: activity.startDate,

    end_date: activity.endDate || null,

    time: activity.time || null,

    event_activity: activity.eventActivity || null,

    destination: activity.destination || null,

    hotel: activity.hotel || null,

    flight: activity.flight || null,

    status: activity.status,

    notes: activity.notes || null

  };

 

  let result;

  if (editingEventId !== null || editingOriginalEvent !== null) {

    let query = supabaseClient.from("UJV_AP_Calendar").update(dbActivity);

    if (editingEventId !== null && editingEventId !== undefined) {

      query = query.eq("id", editingEventId);

    } else {

      query = query

        .eq("activity_name", editingOriginalEvent.activityName)

        .eq("start_date", editingOriginalEvent.startDate);

    }

    result = await query;

  } else {

    result = await supabaseClient.from("UJV_AP_Calendar").insert(dbActivity);

  }

 

  if (result.error) {

    console.error("Could not save activity:", result.error);

    alert("Could not save the activity. Please check the console and try again.");

    return;

  }

 

  const wasEditing = editingEventId !== null || editingOriginalEvent !== null;

  await loadEvents();

  clearForm();

  stopEditing();

  alert(wasEditing ? "Activity updated successfully." : "Activity added successfully.");

}

 

 

/* =========================

   EDIT ACTIVITY

========================= */

function editEvent(index) {

  const item = events[index];

  if (!item) return;

 

  editingEventId = item.id ?? null;

  editingOriginalEvent = {

    activityName: item.activityName,

    startDate: item.startDate

  };

 

  document.getElementById("activityType").value = item.activityType || "FAM";

  document.getElementById("activityName").value = item.activityName || "";

  document.getElementById("participant").value = item.participant || "";

  document.getElementById("directorHost").value = item.directorHost || "";

  document.getElementById("startDate").value = item.startDate || "";

  document.getElementById("endDate").value = item.endDate || "";

  document.getElementById("time").value = item.time || "";

  document.getElementById("event").value = item.eventActivity || "";

  document.getElementById("destination").value = item.destination || "";

  document.getElementById("hotel").value = item.hotel || "";

  document.getElementById("flight").value = item.flight || "";

  document.getElementById("status").value = item.status || "Confirmed";

  document.getElementById("notes").value = item.notes || "";

 

  const button = document.getElementById("addEventButton");

  button.textContent = "Save Changes";

  button.classList.add("editing-button");

  document.getElementById("activityName").focus();

  document.querySelector(".form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });

  ensureCancelEditButton();

}

 

function ensureCancelEditButton() {

  if (document.getElementById("cancelEditButton")) return;

  const button = document.createElement("button");

  button.type = "button";

  button.id = "cancelEditButton";

  button.className = "view-button";

  button.textContent = "Cancel Edit";

  button.style.marginLeft = "8px";

  button.addEventListener("click", function () {

    clearForm();

    stopEditing();

  });

  document.getElementById("addEventButton").insertAdjacentElement("afterend", button);

}

 

function stopEditing() {

  editingEventId = null;

  editingOriginalEvent = null;

  const button = document.getElementById("addEventButton");

  if (button) {

    button.textContent = "+ Add Activity";

    button.classList.remove("editing-button");

  }

  document.getElementById("cancelEditButton")?.remove();

}

 

 

/* =========================

   LOAD AND SAVE

========================= */

async function loadEvents() {

  const { data, error } = await supabaseClient

    .from("UJV_AP_Calendar")

    .select("*")

    .order("start_date", { ascending: true });

 

  if (error) {

    console.error("Could not load activities:", error);

    alert("Could not load activities from the database.");

    return;

  }

 

  events = (data || []).map(function (item) {

    return {

      id: item.id,

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

 

  refreshDirectorFilter();

  displayEvents();

  renderCalendar();

}

 

function refreshDirectorFilter() {

  const directorFilter = document.getElementById("directorFilter");

  if (!directorFilter) return;

  const previousValue = directorFilter.value || "all";

  const directors = [...new Set(events.map(event => event.directorHost).filter(name => name && name.trim() !== ""))].sort();

  directorFilter.innerHTML = '<option value="all">All Directors</option>';

  directors.forEach(function (name) {

    const option = document.createElement("option");

    option.value = name;

    option.textContent = name;

    directorFilter.appendChild(option);

  });

  directorFilter.value = directors.includes(previousValue) ? previousValue : "all";

}

 

/* =========================

   DISPLAY LIST

========================= */

 

function displayEvents() {

 

   const directorFilter = document.getElementById("directorFilter");

   const selectedDirector = directorFilter ? directorFilter.value : "all";

 

const filteredEvents = selectedDirector === "all"

    ? events

    : events.filter(event => event.directorHost === selectedDirector);

   

  const eventsList =

    document.getElementById("eventsList");

 

  const eventCount =

    document.getElementById("eventCount");

 

 

  if (!eventsList) {

    return;

  }

 

 

  if (eventCount) {

 

    const number = filteredEvents.length;

 

    eventCount.textContent =

      number === 1

        ? "1 activity"

        : `${number} activities`;

 

  }

 

 

  if (filteredEvents.length === 0) {

 

    eventsList.innerHTML = `

 

      <div class="empty-message">

 

        No activities added yet.

 

      </div>

 

    `;

 

    return;

  }

 

 

  eventsList.innerHTML = "";

 

 

  const sortedEvents =

      [...filteredEvents].sort(function(a, b) {

 

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

 

 

      <div class="event-actions" style="display:flex; gap:8px; margin-top:12px;">

        <button type="button" class="view-button edit-button" data-index="${originalIndex}">✏️ Edit</button>

        <button type="button" class="delete-button" data-index="${originalIndex}">Delete</button>

      </div>

 

    `;

 

 

    const editButton = eventCard.querySelector(".edit-button");

    editButton.addEventListener("click", function () {

      editEvent(Number(editButton.dataset.index));

    });

 

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

 

async function deleteEvent(index) {

  const item = events[index];

  if (!item) return;

  if (!confirm("Are you sure you want to delete this activity?")) return;

 

  let query = supabaseClient.from("UJV_AP_Calendar").delete();

  if (item.id !== undefined && item.id !== null) {

    query = query.eq("id", item.id);

  } else {

    query = query.eq("activity_name", item.activityName).eq("start_date", item.startDate);

  }

  const { error } = await query;

  if (error) {

    console.error("Could not delete activity:", error);

    alert("Could not delete the activity.");

    return;

  }

  await loadEvents();

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

 

const directorFilter = document.getElementById("directorFilter");

const selectedDirector = directorFilter ? directorFilter.value : "all";

 

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

 

  const directorFilter = document.getElementById("directorFilter");

  const selectedDirector = directorFilter ? directorFilter.value : "all";

 

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

    ) &&

    (

      selectedDirector === "all" ||

      item.directorHost === selectedDirector

    );

 

  });

 

  /*

    Show up to 3 activities

  */

 

const visibleEvents = dayEvents;

 

 

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

 

      <button type="button" id="selectedEditButton" class="view-button edit-button">✏️ Edit Activity</button>

 

    </div>

 

  `;

 

 

  const selectedEditButton = document.getElementById("selectedEditButton");

  if (selectedEditButton) {

    selectedEditButton.addEventListener("click", function () {

      const index = events.indexOf(item);

      if (index !== -1) editEvent(index);

    });

  }

 

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

  document.getElementById("calendarSection").style.display = "block";

  document.getElementById("listSection").style.display = "none";

  document.getElementById("calendarViewButton").classList.add("active");

  document.getElementById("listViewButton").classList.remove("active");

  renderCalendar();

}

 

function showListView() {

  document.getElementById("calendarSection").style.display = "none";

  document.getElementById("listSection").style.display = "block";

  document.getElementById("calendarViewButton").classList.remove("active");

  document.getElementById("listViewButton").classList.add("active");

  displayEvents();

}

 

function exportEventsToCsv() {

  const directorFilter = document.getElementById("directorFilter");

  const selectedDirector = directorFilter ? directorFilter.value : "all";

  const exportEvents = selectedDirector === "all" ? events : events.filter(event => event.directorHost === selectedDirector);

  const headers = ["Activity Type", "Activity / Trip Name", "Participant", "Director / UJV Host", "Start Date", "End Date", "Time", "Event / Activity", "Destination", "Hotel / Property", "Flight Information", "Status", "Notes"];

  const rows = exportEvents.map(event => [event.activityType, event.activityName, event.participant, event.directorHost, event.startDate, event.endDate, event.time, event.eventActivity, event.destination, event.hotel, event.flight, event.status, event.notes]);

  const csvContent = [headers, ...rows].map(row => row.map(value => `"${String(value || "").replace(/"/g, '""')}"`).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "UJV_Travel_Events_Calendar.csv";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

}

 

/* =========================

   BUTTONS AND INITIAL LOAD

========================= */

const addEventButton = document.getElementById("addEventButton");

if (addEventButton) addEventButton.addEventListener("click", addEvent);

 

document.getElementById("previousMonth")?.addEventListener("click", () => changeMonth(-1));

document.getElementById("nextMonth")?.addEventListener("click", () => changeMonth(1));

document.getElementById("todayButton")?.addEventListener("click", goToToday);

document.getElementById("calendarViewButton")?.addEventListener("click", showCalendarView);

document.getElementById("listViewButton")?.addEventListener("click", showListView);

document.getElementById("exportButton")?.addEventListener("click", exportEventsToCsv);

document.getElementById("directorFilter")?.addEventListener("change", function () {

  displayEvents();

  renderCalendar();

});

 

loadEvents();
