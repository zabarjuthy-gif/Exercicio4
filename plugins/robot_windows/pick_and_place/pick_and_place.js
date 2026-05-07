import RobotWindow from 'https://cyberbotics.com/wwi/R2023b/RobotWindow.js';

window.robotWindow = new RobotWindow();
const benchmarkName = 'Pick and Place';
let timeValue = 0;

const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick); 

window.robotWindow.receive = function(message, robot) {
  // updates the metric
  if (message.startsWith('update:')) {
    timeValue = parseFloat(message.substr(7));
    document.getElementById('time-display').innerHTML = parseSecondsIntoReadableTime(timeValue);
  } else if (message === 'stop') {
    if (typeof sendBenchmarkRecord === 'undefined' || !sendBenchmarkRecord(robot, this, benchmarkName, -timeValue, metricToString))
      document.getElementById('time-display').style.color = 'red';
  } else if (message.startsWith('stop_')) {
    let timeString = message.split('_')[1]
    document.getElementById('time-display').innerHTML = timeString;
    document.getElementById('time-display').style.color = 'green';
    document.querySelector(".text").innerHTML = `
      <h2>${benchmarkName} complete</h2>
      <h3>Congratulations you finished the benchmark!</h3>
      <p>Your current performance is: <b style="color:green;">${timeString}</b></p>
      <p>If you want to submit your controller to the leaderboard, follow the instructions given by the "Register" button on the benchmark page.</p>
    `
    toggleModal()
  } else
    console.log("Received unknown message for robot '" + robot + "': '" + message + "'");

  function metricToString(s) {
    return parseSecondsIntoReadableTime(-parseFloat(s));
  }

  function parseSecondsIntoReadableTime(timeInSeconds) {
    const minutes = timeInSeconds / 60;
    const absoluteMinutes = Math.floor(minutes);
    const m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;
    const seconds = (minutes - absoluteMinutes) * 60;
    const absoluteSeconds = Math.floor(seconds);
    const s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;
    let cs = Math.floor((seconds - absoluteSeconds) * 100);
    if (cs < 10)
      cs = '0' + cs;
    return m + ':' + s + ':' + cs;
  }
};
