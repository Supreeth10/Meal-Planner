import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import { SERVER_URL } from "../configuration/Config";
import {
  getUserFromCookies,
  validateUserID,
} from "../authentication/UserAuthentication";
import {
  daysOfWeeksOptions,
  mealTypeOptions,
  DropdownSelectors,
} from "../ui_components/DropdownButton";

/**
 * React component for managing and deleting meal plans.
 * @returns MealPlanForm component.
 */
export const MealPlanForm = () => {
  const [selectedMealType, setSelectedMealtype] = useState([]);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState([]);
  const [mealPlanDeleted, setMealPlanDeleted] = useState(false);

  // Get user ID from cookies
  const userID = getUserFromCookies();
  validateUserID();

  /**
   * Handles form submission for deleting a meal plan.
   * @param e The form submission event.
   */
  const handleSubmit = (e) => {
    setMealPlanDeleted(true);
  };

  useEffect(() => {
    /**
     * Fetches and deletes the selected meal plan.
     */
    const getMealPlans = async () => {
      const mealplan = await axios.delete(
        `${SERVER_URL}/mealplan/${userID}/${selectedDayOfWeek}/${selectedMealType}`
      );
    };
    void getMealPlans();
  }, [selectedDayOfWeek, selectedMealType, userID]);

  /**
   * Handles the selection of meal types.
   * @param e Selected meal types.
   */
  const handleMealType = (e) => {
    console.log(e);
    setSelectedMealtype(e);
  };

  /**
   * Handles the selection of days of the week.
   * @param e Selected days of the week.
   */
  const handleDay = (e) => {
    console.log(e);
    setSelectedDayOfWeek(e);
  };

  return (
    <>
      <Row>
        <Col>
          <DropdownSelectors
            title="Meal Type"
            options={mealTypeOptions}
            onSelect={handleMealType}
          />
          <h4>You selected {selectedMealType}</h4>
        </Col>
        <Col>
          <DropdownSelectors
            title="Day of Week"
            options={daysOfWeeksOptions}
            onSelect={handleDay}
          />
          <h4>You selected {selectedDayOfWeek}</h4>
        </Col>
        <Col>
          <Button variant="primary" type="submit" onClick={handleSubmit}>
            Delete Meal Plan
          </Button>
        </Col>
      </Row>
      {mealPlanDeleted ? <h1>Deleted</h1> : null}
    </>
  );
};
