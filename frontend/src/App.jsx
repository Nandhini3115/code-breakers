import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Round1Task1 from "./pages/Round1Task1";
import Round1Task2 from "./pages/Round1Task2";
import Round2 from "./pages/Round2";
import Result from "./pages/Result";
import AdminDashboard from "./pages/AdminDashboard";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Login First */}
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/home" element={<Home />} />

        {/* Round 1 Tasks */}
        <Route path="/round1-task1" element={<Round1Task1 />} />
        <Route path="/round1-task2" element={<Round1Task2 />} />

        {/* Round 2 */}
        <Route path="/round2" element={<Round2 />} />

        {/* Result */}
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}
