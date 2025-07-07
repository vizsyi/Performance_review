import { useState } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function AddEmployeeModal({
  show,
  onHide,
  isAddingEmployee,
  conflictEmployeeId,
  addEmployee,
}) {
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    addEmployee(newEmployeeId, newEmployeeName);
  }

  // Derived states
  const hasConflict =
    newEmployeeId !== "" && newEmployeeId === conflictEmployeeId;

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Új alkalmazott
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
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
              autoFocus
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Mégse
          </Button>
          <Button
            type="submit"
            //form="addEmployeeForm"
            disabled={isAddingEmployee}
          >
            {isAddingEmployee ? "Mentés . . ." : "Mentés"}
          </Button>
          "
        </Modal.Footer>
      </form>
    </Modal>
  );
}
