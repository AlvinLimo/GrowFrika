import { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Home darkMode={darkMode} />
    </MainLayout>
  );
}

export default App;