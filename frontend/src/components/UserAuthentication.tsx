import Cookies from "js-Cookie";

export const getUserFromCookies = () => {
  let userIdFromCookie = Cookies.get("user_id");
  return userIdFromCookie ? userIdFromCookie.split("|")[1] : undefined;
};

export const validateUserID = () => {
  const userID = getUserFromCookies();
  if (!userID) {
    alert("You must be logged in to view this page");
    return <></>;
  }
};
