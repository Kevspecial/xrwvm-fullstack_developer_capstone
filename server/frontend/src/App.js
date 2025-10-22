import { Routes, Route } from "react-router-dom";
import LuxuryApp from "./design/LuxuryApp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LuxuryApp />} />
      <Route path="*" element={<LuxuryApp />} />
    </Routes>
  );
}
export default App;