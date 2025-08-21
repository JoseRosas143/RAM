// src/App.jsx (fragmento)
<Route
  path="/dashboard"
  element={
    <AuthGate>
      <Dashboard />
    </AuthGate>
  }
/>
