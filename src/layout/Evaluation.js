import StarRating from "./../components/StarRating";

function EvaluationRow({
  index,
  criterion,
  isCriteriaLoading,
  evaluationMassages,
  onSetEvaluation,
}) {
  function onSetRating(rating) {
    onSetEvaluation(criterion.criterion_id, rating);
  }

  function ignoreRate(e) {
    onSetRating(e.target.checked ? -1 : 0);
  }

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
            onChange={ignoreRate}
          />
        </td>
      )}
      <td>
        {isCriteriaLoading ? (
          ". . ."
        ) : criterion.value === -1 ? null : (
          <StarRating
            defaultRating={criterion.value}
            size={24}
            messages={evaluationMassages}
            onSetRating={onSetRating}
          />
        )}
      </td>
    </tr>
  );
}

export default function Evaluation({
  criteria,
  isCriteriaLoading,
  onSetEvaluation,
  evaluationStat,
}) {
  // Derived states
  const isEvaluationReady = !isCriteriaLoading && evaluationStat.isReady;
  const evaluationMassages = [
    "Gyenge",
    "Fejlesztendő",
    "Megfelelő",
    "Jó",
    "Kiemelkedő",
  ];

  return (
    <div
      className={"evaluation" + (isEvaluationReady ? " evaluation-ready" : "")}
    >
      <table className="table-bordered">
        <thead>
          <tr>
            <th rowSpan={evaluationStat.hasNoRequired ? "2" : "1"}>#</th>
            <th colSpan="2">Értékelési szempontok</th>
            <th>Felettes értékelése</th>
          </tr>
          {evaluationStat.hasNoRequired && (
            <tr>
              <th></th>
              <th colSpan="2">Nem értelmezhető</th>
            </tr>
          )}
        </thead>
        <tbody>
          {criteria.map((criterion, index) => (
            <EvaluationRow
              key={criterion.criterion_id}
              index={index + 1}
              criterion={criterion}
              isCriteriaLoading={isCriteriaLoading}
              evaluationMassages={evaluationMassages}
              onSetEvaluation={onSetEvaluation}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
