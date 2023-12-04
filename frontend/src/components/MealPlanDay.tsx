import { useEffect, useState } from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import { Card } from "react-bootstrap";
import { SERVER_URL } from "../configuration/Config";
import {
  getUserFromCookies,
  validateUserID,
} from "../authentication/UserAuthentication";
import {
  DropdownSelector,
  daysOfWeeksOptions,
} from "../ui_components/DropdownButton";
import { TableComponent } from "../ui_components/TableComponent";

/**
 * Component for displaying the meal plan for a specific day.
 */
export const MealPlanForDay = () => {
  // State to store the meal plan data for the user
  const [mealPlanForUser, setMealPlanForUser] = useState([]);

  // State to store the selected day
  const [selectedDay, setSelectedDay] = useState([]);

  // State to track if a day has been selected
  const [selectedDayState, setselectedDayState] = useState(false);

  // Get the user ID from cookies and validate
  const userID = getUserFromCookies();
  validateUserID();

  // Handler for when a day is selected
  const handleSelectedDay = (e) => {
    setSelectedDay(e);
    setselectedDayState(true);
  };

  // Effect hook to fetch the meal plans when the component mounts or the selected day changes
  useEffect(() => {
    const fetchMealPlan = async () => {
      const mealPlan = await axios.get(
        `${SERVER_URL}/mealplan/${userID}/${selectedDay}`
      );

      // Set the meal plan data in the state
      setMealPlanForUser(await mealPlan.data);
    };
    void fetchMealPlan();
  }, [selectedDay, userID]);

  // Render the component with dropdown selector, selected day display, and results
  return (
    <>
      <Row>
        <DropdownSelector
          title="Day of Week"
          options={daysOfWeeksOptions}
          onSelect={handleSelectedDay}
          selectedValue={selectedDay}
        />
        <h4>You selected {selectedDay}</h4>
      </Row>
      {selectedDayState ? selectedDayResults(mealPlanForUser) : null}
    </>
  );
};

/**
 * Function to render the results for the selected day.
 * @param mealPlanForUser - The meal plan data for the selected day.
 */
const selectedDayResults = (mealPlanForUser) => {
  // Headers for the table component
  const headers = ["Meal Type", "Day", "Recipe"];

  // Rows for the table component based on the meal plan data
  const rows = mealPlanForUser.map((mp) => [
    mp.mealType,
    mp.dayOfWeek,
    mp.recipe.recipeName,
  ]);

  // Render a card with the table component displaying the meal plan for the selected day
  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Meal Plan</Card.Title>
        <TableComponent headers={headers} rows={rows} />
      </Card.Body>
    </Card>
  );
};
