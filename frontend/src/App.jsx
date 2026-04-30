import "./App.css";
import { RouterProvider } from "react-router-dom";
import routes from "./routes";
import NavigationComponent from "./components/NavigationComponent";
import FooterComponent from "./components/FooterComponent";
import AuthContext from "./context/authContext";
import NotificationContext from "./context/notificationContext";

export default function App() {
  return (
    <>
      <NotificationContext.ProviderWrapper>
        <AuthContext.ProviderWrapper>
          <div className="App">
            <NavigationComponent />
            <RouterProvider router={routes} />
            <FooterComponent />
          </div>
        </AuthContext.ProviderWrapper>
      </NotificationContext.ProviderWrapper>
    </>
  );
}
