const input = document.querySelector("#todo-input");
const list = document.querySelector(".todo-list");
const itemsLeft = document.querySelector("#items-left");
const filterBtns = document.querySelectorAll(".filters button");
const clearBtn = document.querySelector("#clear-completed");

let todos = [];

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && input.value.trim() !== "") {
    addTodo(input.value.trim());
    input.value = "";
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
    li.draggable = true;
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

    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop);
    li.addEventListener("dragend", dragEnd);
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

let dragSrcEl = null;

function dragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", this.dataset.id);
  this.style.opacity = "0.5";
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function drop(e) {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData("text/plain");
  const targetId = this.dataset.id;

  if (draggedId !== targetId) {
    const draggedIndex = todos.findIndex(t => t.id == draggedId);
    const targetIndex = todos.findIndex(t => t.id == targetId);

    const [moved] = todos.splice(draggedIndex, 1);
    todos.splice(targetIndex, 0, moved);

    renderTodos(currentFilter());
  }
}

function dragEnd() {
  this.style.opacity = "1";
}

renderTodos();
