import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/ToastProvider";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import OfferListing from "./pages/OfferListing";
import OfferDetail from "./pages/OfferDetail";
import BookingConfirm from "./pages/BookingConfirm";
import Login from "./pages/Login";
import NotificationLogin from "./pages/NotificationLogin";
import NotificationPreferences from "./pages/NotificationPreferences";
import NotificationHistory from "./pages/NotificationHistory";

import Dashboard from "./pages/admin/Dashboard";
import ManageOffers from "./pages/admin/ManageOffers";
import CreateOffer from "./pages/admin/CreateOffer";
import EditOffer from "./pages/admin/EditOffer";      // ✅ NEW
import ManageSlots from "./pages/admin/ManageSlots";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminSettings from "./pages/admin/AdminSettings";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<OfferListing />} />
              <Route path="/offers/:id" element={<OfferDetail />} />
              <Route path="/booking/confirm/:slotId" element={<BookingConfirm />} />
              <Route path="/login" element={<Login />} />
              <Route path="/notifications/login" element={<NotificationLogin />} />
              <Route path="/notifications/preferences" element={<NotificationPreferences />} />
              <Route path="/notifications/history" element={<NotificationHistory />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/offers" element={<ManageOffers />} />
              <Route path="/admin/offers/new" element={<CreateOffer />} />
              <Route path="/admin/offers/:id/edit" element={<EditOffer />} />  {/* ✅ NEW */}
              <Route path="/admin/offers/:id/slots" element={<ManageSlots />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;