document.addEventListener("DOMContentLoaded", function() {
  $('#task-input').select2({
    placeholder: "-- Select or type a task --",
    tags: true,
    allowClear: true
  });

  const list = document.querySelector(".todo-list");
  const itemsLeft = document.querySelector("#items-left");
  const filterBtns = document.querySelectorAll(".filters button");
  const clearBtn = document.querySelector("#clear-completed");
  const addBtn = document.querySelector("#add-task");
  const alarmAudio = document.createElement("audio");
  document.body.appendChild(alarmAudio);

  let audioUnlocked = false;
  function unlockAudio() {
    if (!audioUnlocked) {
      alarmAudio.play().catch(() => {});
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
      audioUnlocked = true;
    }
  }
  document.body.addEventListener("click", unlockAudio, { once: true });

  const ringtones = [
    "alarm.mp3/alarm1.mp3",
    "alarm.mp3/alarm2.mp3",
    "alarm.mp3/alarm3.mp3"
  ];

  let todos = [];

  function randomRingtone() {
    return ringtones[Math.floor(Math.random() * ringtones.length)];
  }

  addBtn.addEventListener("click", () => {
    const input = document.querySelector("#task-input");
    const value = input.value.trim();
    if (value !== "") {
      addTodo(value);
      $('#task-input').val(null).trigger('change');
    }
  });

  function addTodo(text) {
    const todo = {
      id: Date.now(),
      text,
      completed: false,
      date: null,
      time: null,
      completedAt: null,
      alarmTriggered: false,
      alarmRingtone: randomRingtone()
    };
    todos.push(todo);
    renderTodos(currentFilter(), true);
  }

  function renderTodos(filter = "all", animate = false) {
    list.innerHTML = "";
    let filtered = todos;
    if (filter === "active") filtered = todos.filter(t => !t.completed);
    if (filter === "completed") filtered = todos.filter(t => t.completed);

    filtered.forEach(todo => {
      const li = document.createElement("li");
      li.dataset.id = todo.id;
      if (todo.completed) li.classList.add("completed");

      const span = document.createElement("span");
      span.className = "task-text";
      span.textContent = todo.text;

      const countdown = document.createElement("span");
      countdown.className = "countdown";
      countdown.style.display = "none";

      const controls = document.createElement("div");
      controls.className = "task-controls";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => {
        toggleTodo(todo.id);
        stopAlarm(todo);
      });

      const dateInput = document.createElement("input");
      dateInput.type = "datetime-local";
      dateInput.value = todo.date && todo.time ? `${todo.date}T${todo.time}` : "";
      dateInput.style.display = "none";
      dateInput.addEventListener("input", e => {
        const [d, t] = e.target.value.split("T");
        todo.date = d;
        todo.time = t;
        todo.alarmTriggered = false;
        todo.alarmRingtone = randomRingtone();
        dateInput.style.display = "none";
        countdown.style.display = "none";
      });

      const calendarBtn = document.createElement("button");
      calendarBtn.innerHTML = '<i class="fas fa-calendar"></i>';
      calendarBtn.addEventListener("click", () => {
        const show = dateInput.style.display === "none";
        dateInput.style.display = show ? "inline-block" : "none";
        countdown.style.display = show ? "inline-block" : "none";
      });

      const alarmBtn = document.createElement("button");
      alarmBtn.innerHTML = '<i class="fas fa-bell"></i>';
      alarmBtn.addEventListener("click", () => stopAlarm(todo));

      const del = document.createElement("button");
      del.innerHTML = '<i class="fas fa-trash"></i>';
      del.addEventListener("click", () => {
        stopAlarm(todo);
        deleteTodo(todo.id);
      });

      controls.appendChild(checkbox);
      controls.appendChild(calendarBtn);
      controls.appendChild(dateInput);
      controls.appendChild(alarmBtn);
      controls.appendChild(del);

      li.appendChild(span);
      li.appendChild(countdown);
      li.appendChild(controls);
      list.appendChild(li);

      if (animate) setTimeout(() => li.classList.add("show"), 50);
      else li.classList.add("show");
    });

    updateItemsLeft();
  }

  function toggleTodo(id) {
    todos = todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, completedAt: !todo.completed ? new Date() : null }
        : todo
    );
    renderTodos(currentFilter());
  }

  function deleteTodo(id) {
    const li = document.querySelector(`li[data-id='${id}']`);
    li.style.transition = "all 0.5s ease";
    li.style.transform = "translateX(100%)";
    li.style.opacity = 0;
    setTimeout(() => {
      todos = todos.filter(todo => todo.id !== id);
      renderTodos(currentFilter());
    }, 500);
  }

  function stopAlarm(todo) {
    todo.alarmTriggered = false;
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    const li = document.querySelector(`li[data-id='${todo.id}']`);
    if (li) li.classList.remove("alarm-flash");
    const countdown = li ? li.querySelector(".countdown") : null;
    if (countdown) countdown.textContent = "";
  }

  function updateItemsLeft() {
    const count = todos.filter(t => !t.completed).length;
    itemsLeft.textContent = `${count} items left`;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTodos(btn.dataset.filter);
    });
  });

  function currentFilter() {
    return document.querySelector(".filters button.active").dataset.filter;
  }

  clearBtn.addEventListener("click", () => {
    const completedTodos = todos.filter(t => t.completed);
    completedTodos.forEach(todo => stopAlarm(todo));
    completedTodos.forEach(todo => {
      const li = document.querySelector(`li[data-id='${todo.id}']`);
      if (li) {
        li.style.transition = "all 0.5s ease";
        li.style.transform = "translateX(100%)";
        li.style.opacity = 0;
      }
    });
    setTimeout(() => {
      todos = todos.filter(t => !t.completed);
      renderTodos(currentFilter());
    }, 500);
  });

  setInterval(() => {
    todos.forEach(todo => {
      const li = document.querySelector(`li[data-id='${todo.id}']`);
      if (!li) return;

      const countdown = li.querySelector(".countdown");

      if (todo.date && todo.time && !todo.completed) {
        const alarmTime = new Date(`${todo.date}T${todo.time}`);
        const now = new Date();
        const diff = alarmTime - now;

        if (diff > 0) {
          if (countdown) {
            const hrs = Math.floor(diff / 1000 / 3600);
            const mins = Math.floor((diff / 1000 % 3600) / 60);
            const secs = Math.floor(diff / 1000 % 60);
            countdown.textContent = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
          }
        } else if (!todo.alarmTriggered) {
          alarmAudio.src = todo.alarmRingtone;
          alarmAudio.play();
          todo.alarmTriggered = true;
          if (li) li.classList.add("alarm-flash");
          if (countdown) countdown.textContent = "⏰ Alarm!";
        }
      }
    });
  }, 1000);

  renderTodos(currentFilter());
});