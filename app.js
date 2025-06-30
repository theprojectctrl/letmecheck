// === State & Elements ===
let totalTasks = 0;
let completedCount = 0;

const board = document.getElementById('board');
const progressBar = document.getElementById('progressBar');
const motivator = document.getElementById('motivator');
const completedTasksContainer = document.getElementById('completed-tasks');
const toggleBtn = document.getElementById('toggleTheme');
const addColumnBtn = document.getElementById('addColumn');
const body = document.body;
const iconSun = document.getElementById('iconSun');
const iconMoon = document.getElementById('iconMoon');

// --- Theme Toggle ---
toggleBtn.addEventListener('click', () => {
  if (body.classList.contains('light-mode')) {
    body.classList.replace('light-mode', 'dark-mode');
    iconSun.style.display = 'none';
    iconMoon.style.display = 'inline';
    setDarkTheme();
  } else {
    body.classList.replace('dark-mode', 'light-mode');
    iconSun.style.display = 'inline';
    iconMoon.style.display = 'none';
    setLightTheme();
  }
  saveState();
});

// Light & Dark Theme Styling Helpers
function setLightTheme() {
  body.style.backgroundColor = '#f9fbfd';
  body.style.color = '#2f3e4f';
}

function setDarkTheme() {
  body.style.backgroundColor = '#1f2937';
  body.style.color = '#d1d5db';
}

// Update Progress Bar and Motivator Text
function updateProgress() {
  const percent = totalTasks === 0 ? 0 : (completedCount / totalTasks) * 100;
  progressBar.style.width = percent + '%';
  progressBar.setAttribute('aria-valuenow', percent.toFixed(0));

  if (completedCount === 0) {
    motivator.textContent = "Let’s complete some tasks!";
  } else if (percent < 50) {
    motivator.textContent = "Great start! Keep going 💪";
  } else if (percent < 100) {
    motivator.textContent = "You're crushing it! 🔥";
  } else {
    motivator.textContent = "🎉 All done! Amazing work!";
  }
}

// Task Completion Handler
function completeTask(checkbox) {
  const task = checkbox.closest('.task');
  const content = task.querySelector('.task-content').innerText.trim();

  if (!checkbox.checked) {
    // Undo completion
    completedCount = Math.max(0, completedCount - 1);
    totalTasks++;
    removeCompletedTask(content);
    updateProgress();
    saveState();
    return;
  }

  // Animate & remove task visually
  task.style.opacity = 0;
  task.style.transform = 'translateX(100px)';
  setTimeout(() => task.remove(), 300);

  // Add to completed section
  addCompletedTask(content);

  completedCount++;
  totalTasks--;
  updateProgress();

  // Confetti celebration
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 }
  });

  saveState();
}

// Add completed task visually
function addCompletedTask(text) {
  const completed = document.createElement('div');
  completed.className = 'completed-task';
  completed.textContent = text;
  completedTasksContainer.appendChild(completed);
}

// Remove completed task visually
function removeCompletedTask(text) {
  Array.from(completedTasksContainer.children).forEach(el => {
    if (el.textContent === text) el.remove();
  });
}

// Add a new task inside a column
function addTask(button) {
  const column = button.closest('.column');
  const taskList = column.querySelector('.tasks');

  const task = document.createElement('div');
  task.className = 'task';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.onchange = () => completeTask(checkbox);

  const editable = document.createElement('div');
  editable.contentEditable = true;
  editable.className = 'task-content';
  editable.textContent = 'New Task...';

  editable.addEventListener('blur', () => {
    if (editable.textContent.trim() === '') {
      task.remove();
      totalTasks--;
      updateProgress();
      saveState();
    } else {
      saveState();
    }
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-task';
  delBtn.innerHTML = '❌';
  delBtn.onclick = () => {
    task.remove();
    totalTasks--;
    updateProgress();
    saveState();
  };

  task.appendChild(checkbox);
  task.appendChild(editable);
  task.appendChild(delBtn);

  taskList.appendChild(task);
  editable.focus();

  totalTasks++;
  updateProgress();
  saveState();
}

// Delete entire column and its tasks
function deleteColumn(button) {
  const column = button.closest('.column');
  const numTasks = column.querySelectorAll('.task').length;
  totalTasks -= numTasks;
  if (totalTasks < 0) totalTasks = 0;
  column.remove();
  updateProgress();
  saveState();
}

// Create new column with optional title and tasks
function createColumn(title = 'New Column', tasks = []) {
  const column = document.createElement('div');
  column.className = 'column';

  column.innerHTML = `
    <h2 contenteditable="true" aria-label="Column title">${title}</h2>
    <div class="tasks"></div>
    <div class="column-buttons">
      <button onclick="addTask(this)">+ Task</button>
      <button onclick="deleteColumn(this)">🗑️</button>
    </div>
  `;

  const tasksContainer = column.querySelector('.tasks');

  tasks.forEach(taskData => {
    const task = document.createElement('div');
    task.className = 'task';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = taskData.completed || false;
    checkbox.onchange = () => completeTask(checkbox);

    const editable = document.createElement('div');
    editable.contentEditable = true;
    editable.className = 'task-content';
    editable.textContent = taskData.content || 'New Task...';

    editable.addEventListener('blur', () => {
      if (editable.textContent.trim() === '') {
        task.remove();
        totalTasks--;
        updateProgress();
        saveState();
      } else {
        saveState();
      }
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-task';
    delBtn.innerHTML = '❌';
    delBtn.onclick = () => {
      task.remove();
      totalTasks--;
      updateProgress();
      saveState();
    };

    task.appendChild(checkbox);
    task.appendChild(editable);
    task.appendChild(delBtn);

    tasksContainer.appendChild(task);

    if (checkbox.checked) completedCount++;
    totalTasks++;
  });

  board.appendChild(column);
  updateProgress();
  saveState();
}

// Save & Load state in localStorage
function saveState() {
  const columns = [];

  document.querySelectorAll('.column').forEach(col => {
    const title = col.querySelector('h2').innerText.trim();
    const tasks = [];

    col.querySelectorAll('.task').forEach(taskEl => {
      const content = taskEl.querySelector('.task-content').innerText.trim();
      const completed = taskEl.querySelector('input[type="checkbox"]').checked;
      if (content !== '') tasks.push({ content, completed });
    });

    columns.push({ title, tasks });
  });

  const completedTasks = [];
  completedTasksContainer.querySelectorAll('.completed-task').forEach(ct => {
    completedTasks.push(ct.textContent);
  });

  const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';

  localStorage.setItem('projectCtrlData', JSON.stringify({ columns, completedTasks, theme }));
}

function loadState() {
  const dataStr = localStorage.getItem('projectCtrlData');
  if (!dataStr) {
    // No saved data: add default example
    createColumn('Example Tasks', [{ content: 'Start your research', completed: false }]);
    return;
  }

  const data = JSON.parse(dataStr);

  if (data.theme === 'dark') {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    iconSun.style.display = 'none';
    iconMoon.style.display = 'inline';
    setDarkTheme();
  } else {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
    iconSun.style.display = 'inline';
    iconMoon.style.display = 'none';
    setLightTheme();
  }

  // Clear current board & completed tasks
  board.innerHTML = '';
  completedTasksContainer.innerHTML = '';
  totalTasks = 0;
  completedCount = 0;

  data.columns.forEach(col => createColumn(col.title, col.tasks));
  data.completedTasks.forEach(text => addCompletedTask(text));

  completedCount = data.completedTasks.length;
  updateProgress();
}

// Initialize
loadState();

// Add column button handler
addColumnBtn.addEventListener('click', () => createColumn());
