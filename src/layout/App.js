//import { env } from "./../environment";
import { useCallback, useEffect, useRef, useState } from "react";

import "./App.css";
//import logo from "./../logo.svg";

import DataFetch from "../data/lambdaAdapter";

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

  //* Functions calling Fetch functions *//

  const setEmployee = useCallback(
    employee_id => {
      if (
        isEvaluationChanged &&
        !window.confirm(
          "Nem mentetted el a módosításokat.\nBiztosan másik alkalmazottra akarsz váltani?"
        )
      )
        return;

      setEmployee_id(employee_id);
      setEvaluationChanged(false);
      data.current.getEvaluation(employee_id);
    },
    [isEvaluationChanged, setEvaluationChanged, setEmployee_id]
  );

  const data = useRef();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    data.current = new DataFetch({
      setCriteria,
      setCriteriaEmployee_id,
      setConflictEmployeeId,
      setaddEmpModalShow,
      setEvaluationChanged,
      setAddingEmployee,
      setSavingEvaluation,
      sortAndSetEmployees,
      setEmployee,
    });

    data.current.getCriteria(setCriteria, sortAndSetEmployees, setFirstLoading);
    hasInitialized.current = true;
  }, [setEmployee]);

  /*
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
    data.current.getEvaluation(employee_id);
  }
*/
  function addEmployee(empId, empName) {
    data.current.addEmployee(empId, empName, isEvaluationChanged);
  }

  function saveEvaluation() {
    data.current.saveEvaluation(
      criteriaEmployee_id,
      criteria,
      isEvaluationChanged
    );
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
