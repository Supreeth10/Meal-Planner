import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import {
  DropdownSelector,
  daysOfWeeksOptions,
  mealTypeOptions,
} from "./DropdownButton";
import { Card } from "react-bootstrap";
import axios from "axios";
import "../Dashboard.css";
import { SERVER_URL } from "./Config";
import { URLS } from "./ConstantsPaths";
import { getUserFromCookies, validateUserID } from "./UserAuthentication";

export const PostMealPlanForm = () => {
  const [mealType, setMealType] = useState([]);
  const [selectedDay, setSelectedDay] = useState([]);
  const [recipeID, setRecipeID] = useState([]);
  const [check, setCheck] = useState(false);

  // Get user ID from cookies
  const userID = getUserFromCookies();
  validateUserID();
  const handleSubmit = (e) => {
    setCheck(true);
  };
  useEffect(() => {
    const getMealPlans = async () => {
      const postData = {
        userId: userID.toString(),
        mealType: mealType.toString(),
        dayOfWeek: selectedDay.toString(),
        recipeId: Number(recipeID),
      };

      try {
        const mealplan = await axios.post(
          SERVER_URL + URLS.MEAL_PLANS,
          postData
        );
        console.log(mealplan.data);
      } catch (error) {
        console.error(error);
      }
    };
    void getMealPlans();
  }, [selectedDay, mealType, recipeID, userID]);

  const handleDaySelection = (e) => {
    console.log(e);
    setSelectedDay(e);
  };
  const handleMealType = (e) => {
    console.log(e);
    setMealType(e);
  };
  const handleRecipeID = (e) => {
    console.log(e.target.value);
    setRecipeID(e.target.value);
  };

  return (
    <>
      <h3>
        Please add the existing recipe ID. View existing recipes and its ID in
        the Recipes tab
      </h3>
      <Row>
        <DropdownSelector
          title="Day of Week"
          options={daysOfWeeksOptions}
          onSelect={handleDaySelection}
          selectedValue={selectedDay}
        />
        <h4>You selected {selectedDay}</h4>
      </Row>
      <Row>
        <DropdownSelector
          title="Meal Type"
          options={mealTypeOptions}
          onSelect={handleMealType}
          selectedValue={mealType}
        />
        <h4>You selected {mealType}</h4>
      </Row>
      <Row>
        <Form.Group controlId="RecipeID">
          <Form.Label className="mt-5">Enter recipe ID: </Form.Label>
          <Form.Control
            className="mx-auto postMP"
            type="text"
            placeholder="recipeID"
            onChange={handleRecipeID}
          />
          <h4>You selected {recipeID}</h4>
        </Form.Group>
      </Row>
      <Row>
        <Button
          className="mx-auto mt-5 postMP"
          variant="primary"
          size="lg"
          type="submit"
          onClick={handleSubmit}
        >
          Add Meal Plan
        </Button>
      </Row>
      {check ? PostSuccess() : null}
    </>
  );
};

const PostSuccess = () => {
  return (
    <Card className="mt-5">
      <h1>Success!</h1>
    </Card>
  );
};
