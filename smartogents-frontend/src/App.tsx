import { Route, Routes } from "react-router-dom";
import { Navigation } from "./components/navigation";

import Home from "./pages/home";
import Contracts from "./pages/contracts";
import UploadContract from "./pages/upload-contract";
import Contract from "./pages/contract";

function App() {
  return (
    <div>
      <div className="main">
        <div className="gradient" />
      </div>
      <div className="app">
        <Navigation />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/upload-contract" element={<UploadContract />} />
          <Route path="/contract/:address" element={<Contract />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
