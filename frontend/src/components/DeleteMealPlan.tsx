import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import { SERVER_URL } from "./Config";
import { getUserFromCookies, validateUserID } from "./UserAuthentication";
import { daysOfWeeksOptions, mealTypeOptions, DropdownSelectors } from "../ui_components/DropdownButton";

export const MealPlanForm = () => {
  const [selectedMealType, setSelectedMealtype] = useState([]);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState([]);
  const [mealPlanDeleted, setMealPlanDeleted] = useState(false);

  // Get user ID from cookies
  const userID = getUserFromCookies();
  validateUserID();
  const handleSubmit = (e) => {
    setMealPlanDeleted(true);
  };
  useEffect(() => {
    const getMealPlans = async () => {
      const mealplan = await axios.delete(
        `${SERVER_URL}/mealplan/${userID}/${selectedDayOfWeek}/${selectedMealType}`
      );
    };
    void getMealPlans();
  }, [selectedDayOfWeek, selectedMealType, userID]);

  const handleMealType = (e) => {
    console.log(e);
    setSelectedMealtype(e);
  };
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
