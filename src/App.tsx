import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionsProvider } from "@/hooks/useSessionsDB";
import { ThemeProvider } from "@/hooks/useTheme";
import Dashboard from "@/pages/Dashboard";
import SongDetail from "@/pages/SongDetail";
import Library from "@/pages/Library";
import NotFound from "@/pages/NotFound";

const App = () => (
  <ThemeProvider>
    <SessionsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/song/:id" element={<SongDetail />} />
          <Route path="/library" element={<Library />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SessionsProvider>
  </ThemeProvider>
);

export default App;
