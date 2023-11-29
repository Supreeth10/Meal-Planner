import { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "./Config";
import { getUserFromCookies, validateUserID } from "./UserAuthentication";
import { TableComponent } from "../ui_components/TableComponent";

export const MealPlanForUser = () => {
  const [mealPlanForUser, setMealPlanForUser] = useState([]);
  const headers = ["Meal Type", "Day", "Recipe"];
  const rows = mealPlanForUser.map((mp) => [mp.mealType, mp.dayOfWeek, mp.recipe.recipeName]);
  const userID = getUserFromCookies();
  validateUserID();
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

      setMealPlanForUser(await mealplan.data);
    };
    void getMealPlans();
  }, [userID]);

  return (
    <TableComponent headers={headers} rows={rows} />
  );
};
