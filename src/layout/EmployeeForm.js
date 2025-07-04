import Loader from "./Loader";

export default function EmployeeForm({
  isFirstLoading,
  employees,
  employee_id,
  setEmployee,
}) {
  return (
    <div className="employeeform">
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
    </div>
  );
}
