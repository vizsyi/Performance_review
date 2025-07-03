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
  const [isFirstLoading, setFirstLoading] = useState(false);

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
      <EmployeeForm />
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
