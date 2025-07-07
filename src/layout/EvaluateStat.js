export default function EvaluatStat({ isCriteriaLOading, evaluationStat }) {
  return (
    <div className="stat">
      <p>
        {isCriteriaLOading || !evaluationStat.isValid
          ? "-"
          : evaluationStat.isReady
          ? "Kész ✅"
          : "Készenlét: " + evaluationStat.readinessText}
      </p>
      <p>
        Átlag: <b>{evaluationStat.averageText}</b>
      </p>
    </div>
  );
}
