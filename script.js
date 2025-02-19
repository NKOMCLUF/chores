document.addEventListener("DOMContentLoaded", () => {

  const buttonContainer = document.getElementById("buttonContainer")
  const summary = document.getElementById("summary")
  const tableBody = document.querySelector("#recordTable tbody")

  const roomData = {
    Kitchen: { count: 0, total: 0 },
    Bathroom: { count: 0, total: 0 },
    Living: { count: 0, total: 0 },
    Dining: { count: 0, total: 0 },
  }

  buttonContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("room-button")) {
      const room = e.target.dataset.room
      const value = 0.25
      const now = new Date()

      // Update room data
      roomData[room].count++
      roomData[room].total += value

      // Add new row to table
      addTableRow(now, room, value)

      // Update summary
      updateSummary()

      // Send data to server
      sendDataToServer(room, value, now)
    }
  })

  function addTableRow(timestamp, room, value) {
    const row = tableBody.insertRow(0)
    row.innerHTML = `
      <td>${timestamp.toLocaleTimeString()}</td>
      <td>${timestamp.toLocaleDateString()}</td>
      <td>${room}</td>
      <td>${value}</td>
      <td><button class="delete-button" data-room="${room}" data-value="${value}">Delete</button></td>
    `
    row.querySelector(".delete-button").addEventListener("click", deleteRecord)
  }

  function deleteRecord(e) {
    const row = e.target.closest("tr")
    const room = e.target.dataset.room
    const value = Number.parseFloat(e.target.dataset.value)

    // Update room data
    roomData[room].count--
    roomData[room].total -= value

    // Remove row from table
    row.remove()

    // Update summary
    updateSummary()

    // Send delete request to server
    sendDeleteToServer(room, value, new Date(row.cells[1].textContent + " " + row.cells[0].textContent))
  }

  function updateSummary() {
    let summaryText = "Summary: "
    for (const [room, data] of Object.entries(roomData)) {
      if (data.count > 0) {
        const sum = data.total
        summaryText += `${room}: ${sum.toFixed(2)} | `
      }
    }
    summary.textContent = summaryText.slice(0, -3) // Remove last ' | '
  }

  async function sendDataToServer(room, value, timestamp) {
    try {
      const response = await fetch("record.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=add&room=${encodeURIComponent(room)}&value=${value}&timestamp=${timestamp.toISOString()}`,
      })

      if (!response.ok) {
        console.error("Failed to send data to server")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  /*
  async function sendDeleteToServer(room, value, timestamp) {
    try {
      const response = await fetch("record.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=delete&room=${encodeURIComponent(room)}&value=${value}&timestamp=${timestamp.toISOString()}`,
      })

      if (!response.ok) {
        console.error("Failed to send delete request to server")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }
})*/


async function sendDeleteToServer(timestamp, room, value) {
  const response = await fetch('record.php', {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
          'timestamp': timestamp,
          'room': room,
          'value': value
      })
  });

  const result = await response.text();
  console.log(result);
}

// Example usage
//sendDeleteToServer('2025-02-19 15:30:00', 'Living Room', 25.5);

})

