/**
 * Object containing various URLs used in the application
 * @property {string} HOME - The home page URL.
 * @property {string} USERS - The users page URL.
 * @property {string} RECIPES - The recipes page URL.
 * @property {string} SHOPPING_LIST - The shopping list page URL.
 * @property {string} ALL_MEAL_PLANS - The URL for fetching all meal plans.
 * @property {string} DAY_MEAL_PLANS - The URL for fetching meal plans for a specific day.
 * @property {string} DELETE_MEAL_PLAN - The URL for deleting a meal plan.
 * @property {string} POST_MEAL_PLAN - The URL for posting a new meal plan.
 * @property {string} LOGIN - The login page URL.
 * @property {string} LOGOUT - The logout page URL.
 * @property {string} MEAL_PLANS - The general meal plans URL.
 * @property {string} ShoppingList - The URL for a specific shopping list.
 * @property {string} USER - The URL for a specific user.
 */
export const URLS = {
  HOME: "/",
  USERS: "/users",
  RECIPES: "/recipes",
  SHOPPING_LIST: "/shoppinglist",
  ALL_MEAL_PLANS: "/mealplan/all",
  DAY_MEAL_PLANS: "/mealplan/day",
  DELETE_MEAL_PLAN: "/mealplan/delete",
  POST_MEAL_PLAN: "/mealplan/post",
  LOGIN: "http://localhost:3000/login",
  LOGOUT: "http://localhost:3000/logout",
  MEAL_PLANS: "/mealplan",
  ShoppingList: "/shoppingList/",
  USER: "/users/",
};
