import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./components/MainLayout";
import { ToastProvider } from "./context/ToastContext";
import Toast from "./components/Toast";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Toast />
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
