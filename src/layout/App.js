//import logo from "./../logo.svg";
import Title from "./Title";
import EmployeeForm from "./EmployeeForm";
import Evaluation from "./Evaluation";
import "./App.css";

import { env } from "./../environment";
import { useEffect, useState } from "react";
import Loader from "./Loader";

export default function App() {
  const [criteria, setCriteria] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employee_id, setEmployee] = useState("");
  const [isFirstLoading, setFirstLoading] = useState(false);

  function sortAndSetEmployees(employees) {
    employees.forEach(employee => {
      employee.display = employee.name + " (" + employee.employee_id + ")";
    });
    employees.sort((a, b) => {
      if (a.display < b.display) {
        return -1;
      }
      if (a.display > b.display) {
        return 1;
      }
      return 0;
    });
    setEmployees(employees);
  }

  useEffect(function () {
    async function firstFetch() {
      setFirstLoading(true);
      const response = await fetch(env.API_URL + "/criterion", {
        method: "GET",
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        //console.log("Süni", data, data.data.criteria);
        // Handling data
        setCriteria(data.data.criteria);
        sortAndSetEmployees(data.data.employees);
      } else {
        console.log("Error:", response.status, response.statusText);
        // Todo: handling error
      }
      setFirstLoading(false);
    }
    firstFetch();
  }, []);

  return (
    <div className="appcontainer container">
      <Title />
      <EmployeeForm
        isFirstLoading={isFirstLoading}
        employees={employees}
        employee_id={employee_id}
        setEmployee={setEmployee}
      />
      {isFirstLoading ? (
        <Loader size={2} />
      ) : (
        <Evaluation criteria={criteria} hasValue={false} />
      )}
    </div>
  );
}

/*
// Fatching data
    fetch(env.API_URL + "/criterion")
      .then(res => res.json())
      .then(data => {
        console.log("Fetch:", data);
      })
      .catch(err => console.log(err));
*/
