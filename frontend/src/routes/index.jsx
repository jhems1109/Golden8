import { createBrowserRouter } from "react-router-dom";
import { Home, Rooms, NoPage, SignIn } from "../pages";
import About from "../pages/About";
import Amenities from "../pages/Amenities";
import Activities from "../pages/Activities";
import Contact from "../pages/Contact";
import RoomDetails from "../pages/RoomDetails";
import RoomMaintenance from "../pages/RoomMaintenance";
import Notification from "../pages/Notification";
import MyProfile from "../pages/MyProfile";
import ChangePassword from "../pages/ChangePassword";
import ForgotPassword from "../pages/ForgotPassword";
import InputOTP from "../pages/InputOtp";
import ResetPassword from "../pages/ResetPassword";
import PhotoMain from "../pages/PhotoPages/PhotoMain";
import PhotoMnt from "../pages/PhotoPages/PhotoMnt";
import AdminMain from "../pages/AdminPages/AdminMain";
import AdminUserMnt from "../pages/AdminPages/AdminUserMnt";
import AdminRoomMnt from "../pages/AdminPages/AdminRoomMnt";
import AdminParmMnt from "../pages/AdminPages/AdminParmMnt";
import AccountMaintenance from "../pages/AccountMaintenance";

const routes = createBrowserRouter([
  {
    path: "/",
    exact: true,
    element: <Home />,
  },
  {
    path: "/about",
    exact: true,
    element: <About />,
  },
  {
    path: "/amenities",
    exact: true,
    element: <Amenities />,
  },
  {
    path: "/activities",
    exact: true,
    element: <Activities />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },

  // Account-related pages
  {
    path: "/signin",
    exact: true,
    element: <SignIn />,
  },
  {
    path: "/register",
    exact: true,
    element: <AccountMaintenance />,
  },
  {
    path: "/updateaccount",
    exact: true,
    element: <AccountMaintenance />,
  },
  {
    path: "/changepassword",
    exact: true,
    element: <ChangePassword />,
  },
  {
    path: "/forgotpassword",
    exact: true,
    element: <ForgotPassword />,
  },
  {
    path: "/resetpassword",
    exact: true,
    element: <ResetPassword />,
  },
  {
    path: "/inputotp",
    exact: true,
    element: <InputOTP />,
  },
  {
    path: "/notifications",
    exact: true,
    element: <Notification />,
  },
  {
    path: "/myprofile",
    exact: true,
    element: <MyProfile />,
  },

  // Room-related pages
  {
    path: "/rooms",
    exact: true,
    element: <Rooms />,
  },
  {
    path: "/room/:roomid",
    exact: true,
    element: <RoomDetails />,
  },
  {
    path: "/createroom",
    exact: true,
    element: <RoomMaintenance />,
  },
  {
    path: "/updateroom/:roomid",
    exact: true,
    element: <RoomMaintenance />,
  },

  // Photos Update related pages
  {
    path: "/photoshome",
    exact: true,
    element: <PhotoMain />,
  },
  {
    path: "/photosamenities",
    exact: true,
    element: <PhotoMain />,
  },
  {
    path: "/photosactivities",
    exact: true,
    element: <PhotoMain />,
  },
  {
    path: "/photosrooms",
    exact: true,
    element: <PhotoMain />,
  },
  {
    path: "/photocreate",
    exact: true,
    element: <PhotoMnt />,
  },
  {
    path: "/photoupdate/:photoid",
    exact: true,
    element: <PhotoMnt />,
  },

  // Admin pages
  {
    path: "/adminusers",
    exact: true,
    element: <AdminMain />,
  },
  {
    path: "/admincreateuser",
    exact: true,
    element: <AdminUserMnt />,
  },
  {
    path: "/adminupdateuser/:userid",
    exact: true,
    element: <AdminUserMnt />,
  },
  {
    path: "/adminrooms",
    exact: true,
    element: <AdminMain />,
  },
  {
    path: "/admincreateroom",
    exact: true,
    element: <AdminRoomMnt />,
  },
  {
    path: "/adminupdateroom/:roomid",
    exact: true,
    element: <AdminRoomMnt />,
  },
  {
    path: "/adminsystemparameters",
    exact: true,
    element: <AdminMain />,
  },
  {
    path: "/admincreateparm",
    exact: true,
    element: <AdminParmMnt />,
  },
  {
    path: "/adminupdateparm/:parmid",
    exact: true,
    element: <AdminParmMnt />,
  },
  // No page found or not authorized to page
  {
    path: "*",
    exact: true,
    element: <NoPage />,
  },
]);

export default routes;
