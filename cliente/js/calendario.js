const monthYear = document.getElementById("monthYear");
    const calendarDays = document.getElementById("calendarDays");
    let currentDate = new Date();

    function renderCalendar() {
      calendarDays.innerHTML = "";
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      monthYear.textContent = currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });

      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        calendarDays.appendChild(empty);
      }

      for (let day = 1; day <= lastDate; day++) {
        const dayElement = document.createElement("div");
        dayElement.textContent = day;
        dayElement.classList.add("day");
        dayElement.onclick = () => {
          document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
          dayElement.classList.add("selected");
        };
        calendarDays.appendChild(dayElement);
      }
    }

    function prevMonth() {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    }

    function nextMonth() {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    }

    renderCalendar();