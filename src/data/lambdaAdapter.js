import { env } from "./../environment";

export default class DataFetch {
  constructor({
    setCriteria,
    setCriteriaEmployee_id,
    setConflictEmployeeId,
    setaddEmpModalShow,
    setEvaluationChanged,
    setAddingEmployee,
    setSavingEvaluation,
    sortAndSetEmployees,
    setEmployee,
  }) {
    this.setCriteria = setCriteria;
    this.setCriteriaEmployee_id = setCriteriaEmployee_id;
    this.setConflictEmployeeId = setConflictEmployeeId;
    this.setaddEmpModalShow = setaddEmpModalShow;
    this.setEvaluationChanged = setEvaluationChanged;
    this.setAddingEmployee = setAddingEmployee;
    this.setSavingEvaluation = setSavingEvaluation;
    this.sortAndSetEmployees = sortAndSetEmployees;
    this.setEmployee = setEmployee;
  }

  _matchCriteriaWithValue(evaluation) {
    this.setCriteria(prevCriteria =>
      prevCriteria.map(c => {
        const matched = evaluation.find(e => e.criterion_id === c.criterion_id);
        return { ...c, value: matched ? matched.value : 0 };
      })
    );
  }

  async getCriteria(setCriteria, sortAndSetEmployees, setFirstLoading) {
    setFirstLoading(true);
    console.log("getCriteria");
    alert("GCrit");
    try {
      const response = await fetch(env.API_URL + "/criterion", {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setCriteria(data.data.criteria);
        sortAndSetEmployees(data.data.employees);
      } else {
        console.error(
          "getCriteria error:",
          response.status,
          response.statusText
        );
      }
    } catch (err) {
      console.error("getCriteria fetch error:", err);
    } finally {
      setFirstLoading(false);
    }
  }

  async addEmployee(employeeId, employeeName, isEvaluationChanged) {
    const payload = {
      employee_id: employeeId.toLowerCase(),
      name: employeeName,
    };

    this.setAddingEmployee(true);
    try {
      const response = await fetch(env.API_URL + "/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();

        this.sortAndSetEmployees(data.data.employees);
        this.setaddEmpModalShow(false);

        if (!isEvaluationChanged) {
          //todo: need parameter
          this.setEmployee(employeeId);
        }
      } else if (response.status === 409) {
        this.setConflictEmployeeId(employeeId);
      } else {
        this.setaddEmpModalShow(false);
        console.error(
          "addEmployee error:",
          response.status,
          response.statusText
        );
      }
    } catch (err) {
      this.setaddEmpModalShow(false);
      console.error("addEmployee fetch error:", err);
    } finally {
      this.setAddingEmployee(false);
    }
  }

  async getEvaluation(emp_id) {
    try {
      const response = await fetch(env.API_URL + "/evaluation/" + emp_id, {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        if (response.status === 204) {
          this._matchCriteriaWithValue([]);
          this.setCriteriaEmployee_id(emp_id);
        } else {
          const data = await response.json();
          this._matchCriteriaWithValue(data.data.evaluation);
          this.setCriteriaEmployee_id(data.data.employee_id);
        }
      } else {
        console.error(
          "getEvaluation error:",
          response.status,
          response.statusText
        );
      }
    } catch (err) {
      console.error("getEvaluation fetch error:", err);
    }
  }

  async saveEvaluation(employee_id, criteria, isEvaluationChanged) {
    if (!isEvaluationChanged) return;
    const evaluation = criteria.map(c => ({
      criterion_id: c.criterion_id,
      value: c.value,
    }));

    const payload = {
      employee_id: employee_id,
      evaluation: evaluation,
    };

    this.setEvaluationChanged(false);
    this.setSavingEvaluation(true);

    try {
      const response = await fetch(env.API_URL + "/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        this._matchCriteriaWithValue(data.data.evaluation);
        this.setCriteriaEmployee_id(data.data.employee_id);
      } else {
        console.error(
          "saveEvaluation error:",
          response.status,
          response.statusText
        );
      }
    } catch (err) {
      console.error("saveEvaluation fetch error:", err);
    }

    this.setSavingEvaluation(false);
  }
}
