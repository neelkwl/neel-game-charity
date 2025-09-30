const form = document.getElementById("checkInForm");
const maxGoal = 50;

// Load counts from localStorage or set to 0
let totalCount = Number(localStorage.getItem("totalCount")) || 0;
let waterCount = Number(localStorage.getItem("waterCount")) || 0;
let zeroCount = Number(localStorage.getItem("zeroCount")) || 0;
let powerCount = Number(localStorage.getItem("powerCount")) || 0;

// Load attendee list from localStorage or set to empty array
let attendeeList = [];
try {
  attendeeList = JSON.parse(localStorage.getItem("attendeeList")) || [];
} catch (e) {
  attendeeList = [];
}

// Update UI with loaded values
document.getElementById("attendeeCount").textContent = totalCount;
document.getElementById("waterCount").textContent = waterCount;
document.getElementById("zeroCount").textContent = zeroCount;
document.getElementById("powerCount").textContent = powerCount;
document.getElementById("progressBar").style.width = `${
  (totalCount / maxGoal) * 100
}%`;

// Render attendee list
function renderAttendeeList() {
  const attendeeListElement = document.getElementById("attendeeList");
  attendeeListElement.innerHTML = "";
  for (let i = 0; i < attendeeList.length; i++) {
    const attendee = attendeeList[i];
    const li = document.createElement("li");
    li.className = "attendee-list-item";
    li.textContent = `${attendee.name} – ${attendee.teamLabel}`;
    attendeeListElement.appendChild(li);
  }
}
renderAttendeeList();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const nameInput = document.getElementById("attendeeName");
  const teamSelect = document.getElementById("teamSelect");

  const attendeeName = nameInput.value;
  const selectedTeam = teamSelect.value;

  totalCount = totalCount + 1;
  const progressPercent = (totalCount / maxGoal) * 100;
  // Save total count
  localStorage.setItem("totalCount", totalCount);

  let teamLabel = "";
  if (selectedTeam === "water") {
    teamLabel = "Team Water Wise";
  } else if (selectedTeam === "zero") {
    teamLabel = "Team Net Zero";
  } else if (selectedTeam === "power") {
    teamLabel = "Team Renewables";
  }

  const greeting = `Welcome, ${attendeeName}! You are checked in for ${teamLabel}.`;
  const greetingElement = document.getElementById("greeting");
  greetingElement.textContent = greeting;
  greetingElement.classList.add("success-message");
  greetingElement.style.display = "block";

  // Add attendee to list and save
  attendeeList.push({ name: attendeeName, teamLabel: teamLabel });
  localStorage.setItem("attendeeList", JSON.stringify(attendeeList));
  renderAttendeeList();

  form.reset();

  const attendeeCountSpan = document.getElementById("attendeeCount");
  attendeeCountSpan.textContent = totalCount;

  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = `${progressPercent}%`;

  // Update the correct team's count
  let teamCountSpan = null;
  if (selectedTeam === "water") {
    teamCountSpan = document.getElementById("waterCount");
    waterCount = waterCount + 1;
    teamCountSpan.textContent = waterCount;
    localStorage.setItem("waterCount", waterCount);
  } else if (selectedTeam === "zero") {
    teamCountSpan = document.getElementById("zeroCount");
    zeroCount = zeroCount + 1;
    teamCountSpan.textContent = zeroCount;
    localStorage.setItem("zeroCount", zeroCount);
  } else if (selectedTeam === "power") {
    teamCountSpan = document.getElementById("powerCount");
    powerCount = powerCount + 1;
    teamCountSpan.textContent = powerCount;
    localStorage.setItem("powerCount", powerCount);
  }

  // Check if goal is reached
  if (totalCount >= maxGoal) {
    let winningTeam = "";
    if (waterCount >= zeroCount && waterCount >= powerCount) {
      winningTeam = "Team Water Wise";
    } else if (zeroCount >= waterCount && zeroCount >= powerCount) {
      winningTeam = "Team Net Zero";
    } else {
      winningTeam = "Team Renewables";
    }
    greetingElement.textContent = `🎉 Goal reached! Congratulations to ${winningTeam}! 🎉`;
    greetingElement.classList.add("success-message");
    greetingElement.style.display = "block";
  }
});
