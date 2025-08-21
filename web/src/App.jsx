import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PremiumPage from './pages/PremiumPage';
import VetsPage from './pages/Vets';
import VetRegister from './pages/VetRegister';
import BuyPage from './pages/Buy';
import BuySuccessPage from './pages/BuySuccess';
import BuyCancelPage from './pages/BuyCancel';
import PetRescuePage from './pages/PetRescue';
import ChatBot from './pages/premium/ChatBot';
import DietForm from './pages/premium/DietForm';
import FamilyTree from './pages/premium/FamilyTree';
import PremiumThanksPage from './pages/PremiumThanks';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Dashboard />} />
      <Route path="/vets" element={<VetsPage />} />
      {/* Page for clinics to register themselves */}
      <Route path="/register-vet" element={<VetRegister />} />
      {/* Shop routes for purchasing products and handling Stripe responses */}
      <Route path="/buy" element={<BuyPage />} />
      <Route path="/buy/success" element={<BuySuccessPage />} />
      <Route path="/buy/cancel" element={<BuyCancelPage />} />
      {/* Public rescue profile by microchip */}
      <Route path="/r/:microchip" element={<PetRescuePage />} />
      {/* Premium route with nested routes */}
      <Route path="/premium" element={<PremiumPage />}>
        <Route path="chat" element={<ChatBot />} />
        <Route path="diet" element={<DietForm />} />
        <Route path="family" element={<FamilyTree />} />
      </Route>
      {/* Success page for premium subscription */}
      <Route path="/premium/thanks" element={<PremiumThanksPage />} />
      {/* TODO: define other routes like /r/:microchip, /buy, etc. */}
    </Routes>
  );
};

export default App;