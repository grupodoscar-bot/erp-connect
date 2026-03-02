import { useState } from "react";
import Login from "./Login/Login";
import PruebaWorkspace from "./Prueba/PruebaWorkspace";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);

  const handleLogin = (payload) => {
    setSession({
      usuario: payload?.usuario || null,
      permisos: payload?.permisos || {},
    });
  };

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  return <PruebaWorkspace session={session} />;
}

export default App;
