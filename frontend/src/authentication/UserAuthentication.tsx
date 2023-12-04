import Cookies from "js-Cookie";

/**
 * Retrieves the user ID from cookies.
 * @returns The user ID or undefined if not found.
 */
export const getUserFromCookies = () => {
  let userIdFromCookie = Cookies.get("user_id");
  return userIdFromCookie ? userIdFromCookie.split("|")[1] : undefined;
};

/**
 * Validates the user ID and shows an alert if not present.
 * @returns An empty JSX element (<></>).
 */
export const validateUserID = () => {
  const userID = getUserFromCookies();
  if (!userID) {
    alert("You must be logged in to view this page");
    return <></>;
  }
};
