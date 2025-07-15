// src/utils/activityTracker.js
let lastActivity = Date.now();

function updateActivity() {
  lastActivity = Date.now();
  localStorage.setItem('lastActive', lastActivity);
}

window.addEventListener('mousemove', updateActivity);
window.addEventListener('keydown', updateActivity);
