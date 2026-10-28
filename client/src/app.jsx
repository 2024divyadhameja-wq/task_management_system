import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/tasks" element={<Tasks />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/notifications" element={<Notifications />} />

        <Route path="/login" element={<Login />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;