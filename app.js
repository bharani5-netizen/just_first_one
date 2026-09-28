const loginView = document.getElementById('loginView');
const todoView = document.getElementById('todoView');
const loginForm = document.getElementById('loginForm');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const welcomeText = document.getElementById('welcomeText');
const clearCompletedButton = document.getElementById('clearCompleted');

const USER_KEY = 'daylist-user';
const TASKS_KEY = 'daylist-tasks';
let tasks = readTasks();
let activeFilter = 'all';

function readTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function showApp() {
  const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  loginView.classList.toggle('hidden', Boolean(user));
  todoView.classList.toggle('hidden', !user);
  if (user) {
    welcomeText.textContent = `A fresh start, one task at a time, ${user.name}.`;
    renderTasks();
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const user = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim()
  };
  if (!user.name || !user.email) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  showApp();
});

document.getElementById('logoutButton').addEventListener('click', () => {
  localStorage.removeItem(USER_KEY);
  showApp();
});

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: `${Date.now()}-${Math.random()}`, text, completed: false });
  saveTasks();
  todoInput.value = '';
  renderTasks();
  todoInput.focus();
});

document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle('active', selected);
      filterButton.setAttribute('aria-pressed', String(selected));
    });
    renderTasks();
  });
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

function renderTasks() {
  const remaining = tasks.filter((task) => !task.completed).length;
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'active') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  taskCount.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`;
  taskList.replaceChildren();
  emptyState.classList.toggle('hidden', filteredTasks.length > 0);
  clearCompletedButton.classList.toggle('hidden', !tasks.some((task) => task.completed));

  for (const task of filteredTasks) {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `${task.completed ? 'Mark as to do' : 'Complete'}: ${task.text}`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `Delete ${task.text}`);
    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  }
}

showApp();
