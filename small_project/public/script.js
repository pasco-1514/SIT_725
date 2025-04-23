// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch and display the current time
  function fetchTime() {
    fetch("/api/time")
      .then((response) => response.json())
      .then((data) => {
        document.getElementById(
          "time-display"
        ).textContent = `Date: ${data.date} | Time: ${data.time}`;
      })
      .catch((error) => {
        console.error("Error fetching time:", error);
        document.getElementById("time-display").textContent =
          "Error fetching time. Please try again.";
      });
  }

  // Initial fetch of time
  fetchTime();

  // Event listener for the refresh time button
  document.getElementById("refresh-time").addEventListener("click", fetchTime);

  // Function to perform calculations
  function calculate(operation) {
    const num1 = document.getElementById("num1").value;
    const num2 = document.getElementById("num2").value;

    // Basic validation
    if (num1 === "" || num2 === "") {
      document.getElementById("result").textContent =
        "Please enter both numbers";
      return;
    }

    // Fetch calculation from API
    fetch(`/api/calculate?num1=${num1}&num2=${num2}&operation=${operation}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById(
          "result"
        ).textContent = `Result: ${data.result}`;
      })
      .catch((error) => {
        console.error("Error calculating:", error);
        document.getElementById("result").textContent =
          "Error performing calculation. Please try again.";
      });
  }

  // Event listeners for calculator buttons
  document
    .getElementById("add")
    .addEventListener("click", () => calculate("add"));
  document
    .getElementById("subtract")
    .addEventListener("click", () => calculate("subtract"));
  document
    .getElementById("multiply")
    .addEventListener("click", () => calculate("multiply"));
  document
    .getElementById("divide")
    .addEventListener("click", () => calculate("divide"));
});
