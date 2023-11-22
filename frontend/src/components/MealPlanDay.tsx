import { useEffect, useState } from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import { Card, Table } from "react-bootstrap";
import { SERVER_URL } from "./Config";
import { getUserFromCookies, validateUserID } from "./UserAuthentication";
import { DropdownSelector, daysOfWeeksOptions } from "./DropdownButton";

export const MealPlanForDay = () => {
  const [mealPlanForUser, setMealPlanForUser] = useState([]);
  const [selectedDay, setSelectedDay] = useState([]);
  const [selectedDayState, setselectedDayState] = useState(false);

  const userID = getUserFromCookies();
  validateUserID();
  const handleSelectedDay = (e) => {
    setSelectedDay(e);
    setselectedDayState(true);
  };
  useEffect(() => {
    const fetchMealPlan = async () => {
      const mealPlan = await axios.get(
        `${SERVER_URL}/mealplan/${userID}/${selectedDay}`
      );

      setMealPlanForUser(await mealPlan.data);
    };
    void fetchMealPlan();
  }, [selectedDay, userID]);

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

const selectedDayResults = (mealPlanForUser) => {
  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Meal Plan</Card.Title>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Meal Type</th>
              <th>Day</th>
              <th>Recipe</th>
            </tr>
          </thead>
          <tbody>
            {mealPlanForUser.map((mealTypeItem) => (
              <tr key={mealTypeItem.id}>
                <td>{mealTypeItem.mealType}</td>
                <td>{mealTypeItem.dayOfWeek}</td>
                <td>{mealTypeItem.recipe.recipeName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
