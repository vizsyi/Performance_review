import { env } from "./../environment";
import { useEffect, useState } from "react";

import "./App.css";
//import logo from "./../logo.svg";

import Loader from "./Loader";
import Title from "./Title";
import EmployeeForm from "./EmployeeForm";
import Evaluation from "./Evaluation";
import AddEmployeeModal from "./AddEmployeeModal";

export default function App() {
  const [criteria, setCriteria] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employee_id, setEmployee_id] = useState("");
  const [criteriaEmployee_id, setCriteriaEmployee_id] = useState("");
  const [isFirstLoading, setFirstLoading] = useState(false);
  const [isAddingEmployee, setAddingEmployee] = useState(false);
  const [conflictEmployeeId, setConflictEmployeeId] = useState("");
  const [isEvaluationChanged, setEvaluationChanged] = useState(false);
  const [isSavingEvaluation, setSavingEvaluation] = useState(false);
  const [addEmpModalShow, setaddEmpModalShow] = useState(false);

  function onSetEvaluation(criterion_id, value) {
    const evaluation = criteria.map(criterion => {
      if (criterion.criterion_id === criterion_id) {
        return {
          ...criterion,
          value: value,
        };
      }
      return criterion;
    });
    setCriteria(evaluation);
    setEvaluationChanged(true);
  }

  //* Fetch subfunctions *//

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

  function setEvaluationAfterFetch(evaluation) {
    const criteriaWithValues = criteria.map(criterion => {
      const evaluationCriterion = evaluation.find(
        evalCriterion => evalCriterion.criterion_id === criterion.criterion_id
      );
      return {
        ...criterion,
        value: evaluationCriterion ? evaluationCriterion.value : 0,
      };
    });
    setCriteria(criteriaWithValues);
  }

  //* Fetch functions *//
  async function getCriteria() {
    setFirstLoading(true);
    const response = await fetch(env.API_URL + "/criterion", {
      method: "GET",
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      // Handling data
      setCriteria(data.data.criteria);
      sortAndSetEmployees(data.data.employees);
    } else {
      console.error("Error:", response.status, response.statusText);
    }
    setFirstLoading(false);
  }

  async function addEmployee(employeeId, employeeName) {
    const data = {
      employee_id: employeeId.toLowerCase(),
      name: employeeName,
    };
    setAddingEmployee(true);
    const response = await fetch(env.API_URL + "/employee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    setAddingEmployee(false);
    if (response.ok) {
      const respData = await response.json();
      sortAndSetEmployees(respData.data.employees);
      setaddEmpModalShow(false);
      if (!isEvaluationChanged) setEmployee(employeeId);
    } else {
      if (response.status === 409) {
        setConflictEmployeeId(employeeId);
      } else {
        setaddEmpModalShow(false);
        console.error("Error:", response.status, response.statusText);
      }
    }
  }

  async function getEvaluation(emp_id) {
    const response = await fetch(env.API_URL + "/evaluation/" + emp_id, {
      method: "GET",
      cache: "no-store",
    });
    if (response.ok) {
      // Handling data
      if (response.status === 204) {
        setEvaluationAfterFetch([]);
        setCriteriaEmployee_id(emp_id);
      } else {
        const data = await response.json();
        setEvaluationAfterFetch(data.data.evaluation);
        setCriteriaEmployee_id(data.data.employee_id);
      }
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  }

  async function saveEvaluation() {
    if (!isEvaluationChanged) return;
    const evaluation = criteria.map(criterion => {
      return {
        criterion_id: criterion.criterion_id,
        value: criterion.value,
      };
    });
    const data = {
      employee_id: employee_id,
      evaluation: evaluation,
    };

    setEvaluationChanged(false);
    setSavingEvaluation(true);

    const response = await fetch(env.API_URL + "/evaluation", {
      method: "POST",
      //cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const respData = await response.json();
      setEvaluationAfterFetch(respData.data.evaluation);
      setCriteriaEmployee_id(respData.data.employee_id);
    } else {
      console.error("Error:", response.status, response.statusText);
    }

    setSavingEvaluation(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function firstFetch() {
      try {
        await getCriteria();
      } finally {
        if (isMounted) {
          setFirstLoading(false);
        }
      }
    }

    firstFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  //* Functions calling Fetch functions *//

  function setEmployee(employee_id) {
    if (
      isEvaluationChanged &&
      !window.confirm(
        "Nem mentetted el a módosításokat.\nBiztosan másik alkalmazottra akarsz váltani?"
      )
    )
      return;
    setEmployee_id(employee_id);
    setEvaluationChanged(false);
    getEvaluation(employee_id);
  }

  //* Derived states *//
  const isCriteriaLoading =
    employee_id === "" || employee_id !== criteriaEmployee_id;

  return (
    <>
      <div className="appcontainer container">
        <Title />
        <EmployeeForm
          employees={employees}
          employee_id={employee_id}
          isFirstLoading={isFirstLoading}
          isEvaluationChanged={isEvaluationChanged}
          isSavingEvaluation={isSavingEvaluation}
          setEmployee={setEmployee}
          setaddEmpModalShow={setaddEmpModalShow}
          saveEvaluation={saveEvaluation}
        />
        {isFirstLoading ? (
          <Loader size={2} />
        ) : (
          <Evaluation
            criteria={criteria}
            isCriteriaLoading={isCriteriaLoading}
            onSetEvaluation={onSetEvaluation}
          />
        )}
      </div>
      <AddEmployeeModal
        show={addEmpModalShow}
        onHide={() => setaddEmpModalShow(false)}
        isAddingEmployee={isAddingEmployee}
        conflictEmployeeId={conflictEmployeeId}
        addEmployee={addEmployee}
      />
    </>
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
