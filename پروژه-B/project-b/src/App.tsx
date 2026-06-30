import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChildInfoPage from './pages/ChildInfoPage';
import CoursesPage from './pages/CoursesPage';
import CourseShippingPage from './pages/CourseShippingPage';
import CoursePaymentPage from './pages/CoursePaymentPage';
import CourseConfirmPage from './pages/CourseConfirmPage';
import CourseDonePage from './pages/CourseDonePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChildInfoPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/shipping" element={<CourseShippingPage />} />
        <Route path="/payment" element={<CoursePaymentPage />} />
        <Route path="/confirm" element={<CourseConfirmPage />} />
        <Route path="/done" element={<CourseDonePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
