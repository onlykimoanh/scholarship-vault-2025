import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FormPage from './pages/FormPage';
import TimelinePage from './pages/TimelinePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TimelinePage />} />
        <Route path="/add" element={<FormPage />} />
        <Route path="/edit/:id" element={<FormPage />} />
      </Routes>
    </Layout>
  );
}

export default App; 