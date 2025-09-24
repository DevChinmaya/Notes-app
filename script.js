const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const notesList = document.getElementById('notesList');
const addNoteBtn = document.getElementById('addNoteBtn');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const selectedDateTitle = document.getElementById('selectedDateTitle');
const allNotesList = document.getElementById('allNotesList');

let currentDate = new Date();
let selectedDate = null;

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYearEl.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  calendarEl.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.style.visibility = 'hidden';
    calendarEl.appendChild(empty);
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.textContent = day;
    const cellDate = new Date(year, month, day).toDateString();

    if (today.toDateString() === cellDate) cell.classList.add('today');
    if (selectedDate && selectedDate.toDateString() === cellDate) cell.classList.add('selected');

    cell.addEventListener('click', () => {
      selectedDate = new Date(year, month, day);
      renderCalendar();
      showNotes();
    });
    calendarEl.appendChild(cell);
  }
}

function showNotes() {
  notesList.innerHTML = '';
  if (!selectedDate) {
    selectedDateTitle.textContent = 'Select a Date';
    return;
  }

  const key = selectedDate.toDateString();
  selectedDateTitle.textContent = `Notes for ${key}`;
  const notes = JSON.parse(localStorage.getItem(key)) || [];

  if (notes.length === 0) {
    notesList.innerHTML = '<p>No notes for this date.</p>';
  } else {
    notes.forEach((note, index) => {
      const noteEl = document.createElement('div');
      noteEl.className = 'note';
      noteEl.innerHTML = `
        <h3>${note.title}
          <button class="delete-btn" data-index="${index}">Delete</button>
        </h3>
        <p>${note.content}</p>
      `;
      notesList.appendChild(noteEl);
    });
  }

  notesList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.index;
      deleteNoteFromDate(idx);
    });
  });

  renderAllNotes();
}

function deleteNoteFromDate(index) {
  if (!selectedDate) return;
  const key = selectedDate.toDateString();
  let notes = JSON.parse(localStorage.getItem(key)) || [];
  notes.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(notes));
  showNotes();
}

addNoteBtn.addEventListener('click', () => {
  if (!selectedDate) {
    alert('Please select a date to add a note!');
    return;
  }

  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  if (title && content) {
    const key = selectedDate.toDateString();
    const notes = JSON.parse(localStorage.getItem(key)) || [];
    notes.push({ title, content });
    localStorage.setItem(key, JSON.stringify(notes));
    noteTitle.value = '';
    noteContent.value = '';
    showNotes();
  } else {
    alert('Please enter both title and content.');
  }
});

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

function renderAllNotes() {
  allNotesList.innerHTML = '';
  const allKeys = Object.keys(localStorage);
  let allData = [];

  allKeys.forEach(key => {
    const notes = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(notes)) {
      notes.forEach((note, idx) => allData.push({ date: key, index: idx, ...note }));
    }
  });

  allData.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (allData.length === 0) {
    allNotesList.innerHTML = '<p>No notes available.</p>';
    return;
  }

  allData.forEach(item => {
    const el = document.createElement('div');
    el.className = 'all-note';
    el.innerHTML = `
      <h3>${item.title} <small>(${item.date})</small>
        <button class="delete-btn" data-date="${item.date}" data-index="${item.index}">Delete</button>
      </h3>
      <p>${item.content}</p>
    `;
    allNotesList.appendChild(el);
  });

  // ✅ Corrected selector
  allNotesList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dateKey = e.target.dataset.date;
      const noteIndex = e.target.dataset.index;
      deleteNoteFromAll(dateKey, noteIndex);
    });
  });
}

function deleteNoteFromAll(dateKey, noteIndex) {
  let notes = JSON.parse(localStorage.getItem(dateKey)) || [];
  notes.splice(noteIndex, 1);
  localStorage.setItem(dateKey, JSON.stringify(notes));
  if (selectedDate && selectedDate.toDateString() === dateKey) showNotes();
  renderAllNotes();
}

renderCalendar();
renderAllNotes();
