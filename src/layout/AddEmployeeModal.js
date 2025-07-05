import { useEffect, useRef, useState } from "react";
//import { useState } from "react";

//import "bootstrap/dist/js/bootstrap.bundle.min";
import * as bootstrap from "bootstrap";

export default function AddEmployeeModal({
  isAddingEmployee,
  conflictEmployeeId,
  addEmployee,
}) {
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");

  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const modalEl = modalRef.current;

    // Modal instantiation
    if (modalEl && !bootstrap.Modal.getInstance(modalEl)) {
      new bootstrap.Modal(modalEl);
    }

    // autofocus
    const handleShown = () => {
      inputRef.current?.focus();
    };

    // adding event
    modalEl.addEventListener("shown.bs.modal", handleShown);

    // event cleanup
    return () => {
      modalEl.removeEventListener("shown.bs.modal", handleShown);
    };
  }, []);

  useEffect(() => {
    const modalEl = modalRef.current;

    // 🔧 MODAL PÉLDÁNYOSÍTÁS – ez hiányzik
    if (modalEl && !bootstrap.Modal.getInstance(modalEl)) {
      new bootstrap.Modal(modalEl);
    }

    // ✅ Autofókusz, amikor megjelenik
    const handleShown = () => {
      inputRef.current?.focus();
    };

    modalEl.addEventListener("shown.bs.modal", handleShown);

    return () => {
      modalEl.removeEventListener("shown.bs.modal", handleShown);
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    addEmployee(newEmployeeId, newEmployeeName);
  }

  // Derived states
  const hasConflict =
    newEmployeeId !== "" && newEmployeeId === conflictEmployeeId;

  return (
    <div
      className="modal"
      id="addEmployeeModal"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="addEmployeeModalLabel"
      aria-hidden="true"
      ref={modalRef}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="addEmployeeModalLabel">
              Új alkalmazott
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="employeeId" className="form-label">
                  Törzsszám
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="newEmployeeId"
                  name="employeeId"
                  placeholder="Pl. AB-01"
                  pattern="^[A-Za-z0-9\-]{3,8}$"
                  title="3–8 karakter: csak angol betűk, számok és kötőjel engedélyezett"
                  value={newEmployeeId}
                  onChange={e => setNewEmployeeId(e.target.value)}
                  required
                  ref={inputRef}
                />
                {hasConflict && (
                  <p className="text-danger mt-2">
                    Ez a törzsszám már használatban van.
                  </p>
                )}
                <label htmlFor="employeeName" className="form-label">
                  Név
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="newEmployeeName"
                  name="employeeName"
                  placeholder="Pl. Kiss Péter"
                  minLength={3}
                  maxLength={40}
                  pattern=".{3,40}"
                  title="A név legalább 3, legfeljebb 40 karakter hosszú lehet."
                  value={newEmployeeName}
                  onChange={e => setNewEmployeeName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Mégse
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isAddingEmployee}
              >
                {isAddingEmployee ? "Mentés . . ." : "Mentés"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
