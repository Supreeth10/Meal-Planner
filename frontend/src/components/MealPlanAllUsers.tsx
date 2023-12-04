import { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../configuration/Config";
import {
  getUserFromCookies,
  validateUserID,
} from "../authentication/UserAuthentication";
import { TableComponent } from "../ui_components/TableComponent";

/**
 * Component for displaying the meal plan for a user.
 */
export const MealPlanForUser = () => {
  // State to store the meal plan data for the user
  const [mealPlanForUser, setMealPlanForUser] = useState([]);

  // Headers for the table component
  const headers = ["Meal Type", "Day", "Recipe"];

  // Rows for the table component based on the meal plan data
  const rows = mealPlanForUser.map((mp) => [
    mp.mealType,
    mp.dayOfWeek,
    mp.recipe.recipeName,
  ]);

  // Get the user ID from cookies
  const userID = getUserFromCookies();
  validateUserID();

  // Effect hook to fetch the meal plans when the component mounts or the user ID changes
  useEffect(() => {
    const getMealPlans = async () => {
      /* Note that using Axios here rather than built-in Fetch causes a bit of code bloat
       * It used to be a HUGE problem, because Axios itself is huge
       * Vite, however, contains modern tree shaking (removing unused parts)
       * So if you try swapping in our project, you'll find we only save 6 kilobytes
       */
      const mealplan = await axios.get(
        SERVER_URL + "/mealplan/" + userID.toString()
      );

      // Set the meal plan data in the state
      setMealPlanForUser(await mealplan.data);
    };
    void getMealPlans();
  }, [userID]);

  return <TableComponent headers={headers} rows={rows} />;
};
