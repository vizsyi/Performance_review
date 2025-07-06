import Loader from "./Loader";

export default function EmployeeForm({
  employees,
  employee_id,
  isFirstLoading,
  isEvaluationChanged,
  isSavingEvaluation,
  isDeletingEmployee,
  setEmployee,
  setaddEmpModalShow,
  saveEvaluation,
  deleteEmployee,
}) {
  return (
    <div className="employeeform">
      <button className="btn btn-info" onClick={() => setaddEmpModalShow(true)}>
        Új alkalmazott
      </button>
      {isFirstLoading ? (
        <Loader size={1} />
      ) : (
        <select value={employee_id} onChange={e => setEmployee(e.target.value)}>
          {employees.length === 0 ? (
            <option value="">Nincs értékelendő alkalmazott</option>
          ) : (
            <>
              <option value="" disabled={employee_id !== ""}>
                - Válassz dolgozót! -
              </option>
              {employees.map(employee => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {employee.display}
                </option>
              ))}
            </>
          )}
        </select>
      )}
      <button
        className="btn btn-success"
        disabled={!isEvaluationChanged}
        onClick={saveEvaluation}
      >
        {isSavingEvaluation ? "Mentés. . ." : "Értékelés mentése"}
      </button>
      <button
        className="btn btn-danger"
        disabled={employee_id === "" || isDeletingEmployee}
        onClick={deleteEmployee}
      >
        {isDeletingEmployee ? "Törlés . . ." : "Alkalmazott törlése"}
      </button>
    </div>
  );
}
