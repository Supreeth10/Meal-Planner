import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

/**
 * Options for days of the week.
 * @type {string[]}
 */
export const daysOfWeeksOptions = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

/**
 * Options for meal types.
 * @type {string[]}
 */
export const mealTypeOptions = ["breakfast", "lunch", "dinner"];

// Extracted Dropdown Selector Component
export const DropdownSelector = ({ title, options, onSelect, selectedValue }) => (
    <DropdownButton className="mt-5" title={title} onSelect={onSelect}>
    {options.map((option) => (
      <Dropdown.Item key={option} eventKey={option} active={selectedValue === option}>
        {option.charAt(0).toUpperCase() + option.slice(1)}
      </Dropdown.Item>
    ))}
  </DropdownButton>
);

// Extracted Dropdown Selector Component
export const DropdownSelectors = ({ title, options, onSelect }) => (
  <DropdownButton title={title} onSelect={onSelect}>
    {options.map((option, index) => (
      <Dropdown.Item key={index} eventKey={option}>
        {option.charAt(0).toUpperCase() + option.slice(1)}
      </Dropdown.Item>
    ))}
  </DropdownButton>
);