import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [access, setAccess] = useState("zisťuje sa");
	
  useEffect(() => {
    fetch("/api")
      .then(res => res.json())
      .then(
        (result) => {
          setAccess(result.version);
        },
        (_error) => {
          setAccess("nedostupné");
        }
      )
  }, [])

  return (
    <div className="App">
      <header className="App-header">
		<span>Verzia API: {access}.</span>
      </header>
    </div>
  );
}

export default App;
