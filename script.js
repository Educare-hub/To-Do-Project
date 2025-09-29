document.addEventListener("DOMContentLoaded", function () {
  $('#task-input').select2({
    placeholder: "-- Select or type a task --",
    tags: true, // allows creating new tasks
    allowClear: true
  });

  const list = document.querySelector(".todo-list");
  const itemsLeft = document.querySelector("#items-left");
  const filterBtns = document.querySelectorAll(".filters button");
  const clearBtn = document.querySelector("#clear-completed");
  const addBtn = document.querySelector("#add-task");

  let todos = [];

  addBtn.addEventListener("click", () => {
    const input = document.querySelector("#task-input");
    const value = input.value.trim();
    if (value !== "") {
      addTodo(value);
      $('#task-input').val(null).trigger('change'); // clear dropdown
    }
  });

  function addTodo(text) {
    const todo = { id: Date.now(), text, completed: false };
    todos.push(todo);
    renderTodos();
  }

  function renderTodos(filter = "all") {
    list.innerHTML = "";

    let filtered = todos;
    if (filter === "active") filtered = todos.filter(t => !t.completed);
    if (filter === "completed") filtered = todos.filter(t => t.completed);

    filtered.forEach(todo => {
      const li = document.createElement("li");
      li.className = todo.completed ? "completed" : "";
      li.dataset.id = todo.id;

      const span = document.createElement("span");
      span.textContent = todo.text;
      span.addEventListener("click", () => toggleTodo(todo.id));

      const del = document.createElement("button");
      del.textContent = "✖";
      del.addEventListener("click", () => deleteTodo(todo.id));

      li.appendChild(span);
      li.appendChild(del);
      list.appendChild(li);
    });

    updateItemsLeft();
  }

  function toggleTodo(id) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    renderTodos(currentFilter());
  }

  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    renderTodos(currentFilter());
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
    todos = todos.filter(t => !t.completed);
    renderTodos(currentFilter());
  });

  renderTodos();
});
