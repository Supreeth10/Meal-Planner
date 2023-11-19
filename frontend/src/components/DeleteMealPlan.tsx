import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useEffect, useState } from "react";
import DropdownButton from "react-bootstrap/DropdownButton";
import axios from "axios";
import Cookies from "js-Cookie";

// @ts-ignore
const serverIP = import.meta.env.VITE_BACKEND_IP;
// @ts-ignore
const serverPort = import.meta.env.VITE_BACKEND_PORT;

const serverUrl = `http://${serverIP}:${serverPort}`;
export const MealPlanForm = () => {
  const [mealType, setMealtype] = useState([]);
  const [dayOfWeek, setDay] = useState([]);
  const [mealPlanAll, setMealPlanAll] = useState(false);
  let user_id = Cookies.get("user_id");
  if (user_id !== undefined) user_id = user_id.split("|")[1];
  const [userID] = useState(user_id);
  if (userID === undefined) {
    alert("You must be logged in to view this page");
    return <></>;
  } else {
    const handleSubmit = () => {
      setMealPlanAll(true);
    };
    useEffect(() => {
      const getMealPlans = async () => {
        const mealplan = await axios.delete(
          serverUrl +
          "/mealplan/" +
          userID.toString() +
          "/" +
          dayOfWeek.toString() +
          "/" +
          mealType.toString()
        );
      };
      void getMealPlans();
    }, [dayOfWeek, mealType, userID]);

    const handleMealType = (e) => {
      console.log(e);
      setMealtype(e);
    };
    const handleDay = (e) => {
      console.log(e);
      setDay(e);
    };

    const DropdownSelector = ({ title, options, onSelect }) => (
      <DropdownButton title={title} onSelect={onSelect}>
        {options.map((option) => (
          <Dropdown.Item eventKey={option}>{option}</Dropdown.Item>
        ))}
      </DropdownButton>
    );

    return (
      <>
        <Row>
          <Col>
            <DropdownSelector
              title="Meal Type"
              options={["Breakfast", "Lunch", "Dinner"]}
              onSelect={handleMealType}
            />
            <h4>You selected {mealType}</h4>
          </Col>
          <Col>
            <DropdownSelector
              title="Day of Week"
              options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
              onSelect={handleDay}
            />
            <h4>You selected {dayOfWeek}</h4>
          </Col>
          <Col>
            <Button variant="primary" type="submit" onClick={handleSubmit}>
              Delete Meal Plan
            </Button>
          </Col>
        </Row>
        {mealPlanAll ? <h1>Deleted</h1> : null}
      </>
    );
  }
};
