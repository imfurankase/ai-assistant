import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpring, animated } from '@react-spring/web';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote, faCheckSquare, faBell, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import Logs from './components/Logs';

const apiUrl = 'http://127.0.0.1:5000';

Modal.setAppElement('#root');

function App() {
  const [reminders, setReminders] = useState([]);
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [news, setNews] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [newNote, setNewNote] = useState('');
  const [logEntries, setLogEntries] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState('');
  const [statistics, setStatistics] = useState({
    notes_count: 0,
    todos_count: 0,
    reminders_count: 0,
    logs_count: 0,
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchTodos();
    fetchNotes();
    fetchNews();
    fetchReminders();
    fetchStatistics();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const logAction = async (action) => {
    const newLogEntry = {
      action,
      time: new Date().toLocaleString(),
    };
    setLogEntries([...logEntries, newLogEntry]);
    await axios.post(`${apiUrl}/log`, newLogEntry);
    fetchStatistics(); // Update statistics after adding a log
  };

  const fetchStatistics = async () => {
    const response = await axios.get(`${apiUrl}/statistics`);
    setStatistics(response.data);
  };

  const fetchTodos = async () => {
    const response = await axios.get(`${apiUrl}/todo`);
    setTodos(response.data.todo_list);
    fetchStatistics(); // Update statistics after fetching todos
  };

  const fetchNotes = async () => {
    const response = await axios.get(`${apiUrl}/notes`);
    setNotes(response.data.notes);
    fetchStatistics(); // Update statistics after fetching notes
  };

  const fetchWeather = async () => {
    if (location) {
      const response = await axios.get(`${apiUrl}/weather`, { params: { location } });
      setWeather(response.data);
      logAction(`Fetched weather for ${location}`);
    }
  };

  const fetchNews = async () => {
    const response = await axios.get(`${apiUrl}/technews`);
    setNews(response.data.tech_news);
    logAction('Fetched latest tech news');
  };

  const fetchReminders = async () => {
    const response = await axios.get(`${apiUrl}/reminders`);
    setReminders(response.data.reminders);
    fetchStatistics(); // Update statistics after fetching reminders
  };

  const addReminder = async () => {
    const response = await axios.post(`${apiUrl}/reminder`, {
      text: newReminder,
      time: reminderTime.replace('T', ' ') + ':00',
    });
    alert(response.data.message);
    fetchReminders();
    logAction('Added a new reminder');
  };

  const deleteReminder = async (reminderId) => {
    const response = await axios.delete(`${apiUrl}/reminder`, { data: { id: reminderId } });
    alert(response.data.message);
    fetchReminders();
    logAction(`Deleted reminder: ${reminderId}`);
  };

  const editReminder = async (reminderId, newText, newTime) => {
    const response = await axios.put(`${apiUrl}/reminder`, {
      id: reminderId,
      text: newText,
      time: newTime.replace('T', ' ') + ':00',
    });
    if (response.status === 200) {
      fetchReminders();
      logAction(`Edited reminder: ${reminderId} to ${newText}`);
    } else {
      alert(response.data.error);
    }
  };

  const addTodo = async () => {
    const response = await axios.post(`${apiUrl}/todo`, {
      task: newTodo,
    });
    alert(response.data.message);
    fetchTodos();
    logAction('Added a new to-do');
  };

  const deleteTodo = async (todoId) => {
    const response = await axios.delete(`${apiUrl}/todo`, { data: { id: todoId } });
    alert(response.data.message);
    fetchTodos();
    logAction(`Deleted to-do: ${todoId}`);
  };

  const markTodoDone = async (todoId) => {
    const response = await axios.put(`${apiUrl}/todo`, { id: todoId });
    alert(response.data.message);
    fetchTodos();
    logAction(`Marked to-do as done: ${todoId}`);
  };

  const addNote = async () => {
    const response = await axios.post(`${apiUrl}/notes`, {
      note: newNote,
    });
    alert(response.data.message);
    fetchNotes();
    logAction('Added a new note');
  };

  const deleteNote = async (noteId) => {
    const response = await axios.delete(`${apiUrl}/notes`, { data: { id: noteId } });
    alert(response.data.message);
    fetchNotes();
    logAction(`Deleted note: ${noteId}`);
  };

  const editNote = async (noteId, newNote) => {
    const response = await axios.put(`${apiUrl}/notes`, {
      id: noteId,
      note: newNote,
    });
    if (response.status === 200) {
      fetchNotes();
      logAction(`Edited note: ${noteId} to ${newNote}`);
    } else {
      alert(response.data.error);
    }
  };

  const openModal = (tool) => {
    setCurrentTool(tool);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const cardSpring = useSpring({
    from: { transform: 'scale(0.8)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  });

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1>AI Assistant Dashboard</h1>
          <div className="hamburger" onClick={toggleMenu}>
            <div />
            <div />
            <div />
          </div>
          <div className={`nav-links ${menuOpen ? 'mobile' : ''}`}>
            <Link to="/" onClick={() => openModal('weather')}>Weather</Link>
            <Link to="/" onClick={() => openModal('news')}>Tech News</Link>
            <Link to="/" onClick={() => openModal('reminders')}>Reminders</Link>
            <Link to="/" onClick={() => openModal('todos')}>To-Do List</Link>
            <Link to="/" onClick={() => openModal('notes')}>Notes</Link>
            <Link to="/logs">Logs</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/logs" element={<Logs logEntries={logEntries} />} />
          <Route path="/" element={
            <div className="dashboard">
              <div className="statistics">
                <animated.div className="card" style={cardSpring}>
                  <FontAwesomeIcon icon={faStickyNote} size="3x" color="#ff6b6b" />
                  <h3>Notes</h3>
                  <p>{statistics.notes_count}</p>
                </animated.div>
                <animated.div className="card" style={cardSpring}>
                  <FontAwesomeIcon icon={faCheckSquare} size="3x" color="#4e73df" />
                  <h3>To-Dos</h3>
                  <p>{statistics.todos_count}</p>
                </animated.div>
                <animated.div className="card" style={cardSpring}>
                  <FontAwesomeIcon icon={faBell} size="3x" color="#1cc88a" />
                  <h3>Reminders</h3>
                  <p>{statistics.reminders_count}</p>
                </animated.div>
                <animated.div className="card" style={cardSpring}>
                  <FontAwesomeIcon icon={faClipboardList} size="3x" color="#36b9cc" />
                  <h3>Logs</h3>
                  <p>{statistics.logs_count}</p>
                </animated.div>
              </div>
            </div>
          } />
        </Routes>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Tool Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <button onClick={closeModal} className="close-button">Close</button>
        {currentTool === 'weather' && (
          <div className="section weather">
            <h2>Weather</h2>
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button onClick={fetchWeather}>Get Weather</button>
            {weather && (
              <div>
                <p>{`Weather in ${location}: ${weather.weather_condition}, ${weather.temperature}°C`}</p>
              </div>
            )}
          </div>
        )}
        {currentTool === 'news' && (
          <div className="section news">
            <h2>Tech News</h2>
            <button onClick={fetchNews}>Refresh News</button>
            <ul>
              {news.map((article, index) => (
                <li key={index}><a href={article.href} target="_blank" rel="noopener noreferrer">{article.title}</a></li>
              ))}
            </ul>
          </div>
        )}
        {currentTool === 'reminders' && (
          <div className="section reminders">
            <h2>Reminders</h2>
            <input
              type="text"
              placeholder="Reminder"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
            />
            <input
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
            <button onClick={addReminder}>Add Reminder</button>
            <ul>
              {reminders.map((reminder, index) => (
                <li key={index}>
                  {reminder.text} at {reminder.time}
                  <button onClick={() => deleteReminder(reminder._id)}>Delete</button>
                  <button onClick={() => editReminder(
                    reminder._id,
                    prompt('Edit reminder text:', reminder.text),
                    prompt('Edit reminder time:', reminder.time.replace(' ', 'T'))
                  )}>Edit</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {currentTool === 'todos' && (
          <div className="section todos">
            <h2>To-Do List</h2>
            <input
              type="text"
              placeholder="New To-Do"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <button onClick={addTodo}>Add To-Do</button>
            <ul>
              {todos.map((todo, index) => (
                <li key={index}>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => markTodoDone(todo._id)}
                  />
                  <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
                    {todo.task}
                  </span>
                  <button onClick={() => deleteTodo(todo._id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {currentTool === 'notes' && (
          <div className="section notes">
            <h2>Notes</h2>
            <input
              type="text"
              placeholder="New Note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button onClick={addNote}>Add Note</button>
            <ul>
              {notes.map((note, index) => (
                <li key={index}>
                  {note.note}
                  <button onClick={() => deleteNote(note._id)}>Delete</button>
                  <button onClick={() => editNote(
                    note._id,
                    prompt('Edit note:', note.note)
                  )}>Edit</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </Router>
  );
}

export default App;
