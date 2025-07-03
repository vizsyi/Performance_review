//import logo from "./../logo.svg";
import Title from "./Title";
import EmployeeForm from "./EmployeeForm";
import Evaluation from "./Evaluation";
import "./App.css";

import { env } from "./../environment";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    fetch(env.API_URL + "/criterion")
      .then(res => res.json())
      .then(data => {
        console.log("Süni", data);
      })
      .catch(err => console.log(err));
  }, []);

  console.log(env);
  return (
    <div className="appcontainer container">
      <Title />
      <EmployeeForm />
      <Evaluation />
    </div>
  );
}
