import { Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "./pages/Landing";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;
