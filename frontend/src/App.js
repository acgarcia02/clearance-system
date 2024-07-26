import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/private-route";
import Login from "./pages/login";
import Home from "./pages/home";
import ClearanceForm from "./pages/form";
import ClearanceFormPDF from "./pages/pdf";
import ClearanceRecords from "./pages/records";
import CoordinatorsPage from "./pages/coordinators";
import NotificationsPage from "./pages/notifications";
import NotFound from "./pages/not-found";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact={true} path="/login" element={<Login />} />
          <Route
            exact={true}
            path="/"
            element={
              <PrivateRoute
                Component={Home}
                allowedRoles={["student", "admin", "coordinator"]}
                hasNavbar={true}
              />
            }
          />
          <Route
            exact={true}
            path="/form"
            element={
              <PrivateRoute
                Component={ClearanceForm}
                allowedRoles={["student"]}
                hasNavbar={false}
              />
            }
          />
          <Route
            exact={true}
            path="/form-pdf/:fileId"
            element={
              <PrivateRoute
                Component={ClearanceFormPDF}
                allowedRoles={["student", "admin"]}
                hasNavbar={true}
              />
            }
          />
          <Route
            exact={true}
            path="/records"
            element={
              <PrivateRoute
                Component={ClearanceRecords}
                allowedRoles={["admin", "coordinator"]}
                hasNavbar={true}
              />
            }
          />
          <Route
            exact={true}
            path="/coordinators"
            element={
              <PrivateRoute
                Component={CoordinatorsPage}
                allowedRoles={["admin"]}
                hasNavbar={true}
              />
            }
          />
          <Route
            exact={true}
            path="/notifications"
            element={
              <PrivateRoute
                Component={NotificationsPage}
                allowedRoles={["student", "admin", "coordinator"]}
                hasNavbar={true}
              />
            }
          />
          <Route path="*" element={<NotFound />} />{" "}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
