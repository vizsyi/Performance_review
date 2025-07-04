function EvaluationRow({ index, criterion, isCriteriaLoading }) {
  return (
    <tr
      className={
        !isCriteriaLoading && criterion.value ? "evaluation_row-ready" : ""
      }
    >
      <td>
        <h4>{index}</h4>
      </td>
      <td colSpan={criterion.required ? "2" : "1"}>
        <h5>{criterion.title}</h5>
        <p>{criterion.description}</p>
      </td>
      {criterion.required ? null : (
        <td>
          <input
            type="checkbox"
            checked={!isCriteriaLoading && criterion.value === -1}
          />
        </td>
      )}
      <td>
        {isCriteriaLoading
          ? ". . ."
          : criterion.value === -1
          ? null
          : criterion.value}
      </td>
    </tr>
  );
}

export default function Evaluation({ criteria, isCriteriaLoading }) {
  return (
    <div className="evaluation">
      <table border="1">
        <thead>
          <tr>
            <th></th>
            <th colSpan="2">Értékelési szempontok</th>
            <th>Felettes értékelése</th>
          </tr>
        </thead>
        <tbody>
          {criteria.map((criterion, index) => (
            <EvaluationRow
              key={criterion.criterion_id}
              index={index + 1}
              criterion={criterion}
              isCriteriaLoading={isCriteriaLoading}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
