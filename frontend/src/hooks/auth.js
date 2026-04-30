import { useContext } from "react";
import AuthContext from "../context/authContext";

const useAuth = () => {
  const auth = useContext(AuthContext);
  return auth;
};

export default useAuth;

export const checkIfSignedIn = function(){
  let isAdmin = false
  let isSignedIn = false
  const user = localStorage.getItem("login");
  const parsedUserData = JSON.parse(user);
  if (parsedUserData) {
    isAdmin = parsedUserData.admin ? true : false
    isSignedIn = true
  }
  return {isSignedIn, isAdmin}
}

export const getToken = function(){
  let token = null
  const data = localStorage.getItem("token");
  const parsedData = JSON.parse(data);
  if (parsedData) {
    token = parsedData
  }
  return token
}