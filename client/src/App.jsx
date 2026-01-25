import { useState, useEffect }   from "react"
import NewsColumn from "./components/NewsColumn";

function App(){
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saveMode = localStorage.getItem('darkMode');
    return saveMode === 'true';
  });

  //  state for current date and time
  const [ currentTime, setCurrentTime] = useState(new Date());

  // Effect to update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    
    return () => clearInterval(timer);
  }, []);

  //  dark mode class to body and save preference Effect 
  useEffect (() => {
    if(darkMode) {
      document.body.classList.add('dark-mode');
    }else{
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  //   TOggle dark mode handler
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  //  Date format: " Monday, 19 Jan 2026"
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month:'short',
      year: 'numeric'
    });
  };

  // Time format : "11.45.30 PM"
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour : '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  return (
    <div className={`app-container ${darkMode ?'dark' : 'light'}`}>
      <header className="main-header">
        <div className="header-left">
          <span className="date-display"> {formatDate(currentTime)}</span>
        </div>

        <div className="header-center">
          <h1>NewsMania</h1>
        </div>

        <div className="header-right">
          <span className="time-display">{formatTime(currentTime)}</span>
          <button 
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          >
            {darkMode ? '☀️' : '🌙 '}
          </button>
        </div>
      </header>

      <main className="news-grid">
        <NewsColumn sourceId="thehindu" title="The Hindu" />
        <NewsColumn sourceId="toi" title="Times of India" />
        <NewsColumn sourceId="ht" title="Hindustan Times" />
        <NewsColumn sourceId="ie" title="Indian Express" />
      </main>
      <footer className="main-footer">
        <p>Made With ❤️ by Ashish Bairwa.</p>
      </footer>
    </div>
  );

}

export default App;
