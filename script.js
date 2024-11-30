// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

// Core Firebase App and Analytics
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";
// Firestore (Database)
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";


// Firebase configuration (replace with your project's config)
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Reference for the booked slots in Firestore
const bookedSlotsRef = doc(db, "calendar", "bookedSlots");

// Fetch booked slots from Firestore
async function fetchBookedSlots() {
  const docSnap = await getDoc(bookedSlotsRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return {};
  }
}

// Save booked slot to Firestore
async function saveBookedSlot(date, time) {
  const currentSlots = await fetchBookedSlots();
  if (!currentSlots[date]) {
    currentSlots[date] = [];
  }
  currentSlots[date].push(time);
  await setDoc(bookedSlotsRef, currentSlots);
}

// Listen for changes to the database
onSnapshot(bookedSlotsRef, (docSnap) => {
  if (docSnap.exists()) {
    const updatedSlots = docSnap.data();
    console.log("Updated booked slots:", updatedSlots);
    // Re-render available slots if necessary
  }
});

// Updated booking logic to save to Firestore
document.getElementById("booking-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedDate = document.getElementById("date").value;
  const selectedTime = document.getElementById("start-time").value;

  if (selectedDate && selectedTime) {
    await saveBookedSlot(selectedDate, selectedTime);
    alert(`Successfully booked ${selectedDate} at ${selectedTime}`);
    document.getElementById("booking-form").reset();
  } else {
    alert("Please select a valid date and time.");
  }
});

// Generate and display available slots dynamically
async function populateTimeSlots(date) {
  const allSlots = generateTimeSlots(date);
  const booked = (await fetchBookedSlots())[date] || [];

  timeSelect.innerHTML = "";
  allSlots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    if (booked.includes(slot)) {
      option.disabled = true; // Mark booked slots as unavailable
    }
    timeSelect.appendChild(option);
  });

  // Clear end time options initially
  endTimeSelect.innerHTML = "";
}


document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");

  // Function to generate time slots based on the day of the week
  function generateTimeSlots(date) {
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
    let startHour, endHour;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: 8 AM to 10 PM
      startHour = 8;
      endHour = 22;
    } else {
      // Weekday: 7 PM to 10 PM
      startHour = 19;
      endHour = 22;
    }

    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`);
      slots.push(`${hour % 12 || 12}:30 ${hour >= 12 ? "PM" : "AM"}`);
    }
    return slots;
  }

  // Generate a simple calendar (current month only)
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  calendarEl.innerHTML = `<h2>${currentMonth} ${currentYear}</h2>`;
  const calendarGrid = document.createElement("div");
  calendarGrid.style.display = "grid";
  calendarGrid.style.gridTemplateColumns = "repeat(7, 1fr)";
  calendarGrid.style.gap = "10px";

  for (let i = 1; i <= daysInMonth; i++) {
    const dayEl = document.createElement("button");
    dayEl.textContent = i;
    dayEl.style.padding = "10px";
    dayEl.style.border = "1px solid #ccc";
    dayEl.style.backgroundColor = "#fff";
    dayEl.style.cursor = "pointer";

    // Handle day click
    dayEl.addEventListener("click", () => {
      const selectedDate = `${currentYear}-${today.getMonth() + 1}-${i}`;
      dateInput.value = selectedDate;

      // Populate available time slots
      const slots = generateTimeSlots(selectedDate);
      timeSelect.innerHTML = slots
        .map(slot => `<option value="${slot}">${slot}</option>`)
        .join("");
    });

    calendarGrid.appendChild(dayEl);
  }

  calendarEl.appendChild(calendarGrid);
});



