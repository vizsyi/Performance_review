function EvaluationRow({ index, criterion, hasValue }) {
  return (
    <tr>
      <td>
        <h4>{index}</h4>
      </td>
      <td colSpan={criterion.required ? "2" : "1"}>
        <h5>{criterion.title}</h5>
        <p>{criterion.description}</p>
      </td>
      {criterion.required ? null : (
        <td>
          <input type="checkbox" />
        </td>
      )}
      <td>{hasValue ? criterion.value : ". . ."}</td>
    </tr>
  );
}

export default function Evaluation({ criteria, hasValue }) {
  console.log("crit:", criteria);

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
              hasValue={hasValue}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
