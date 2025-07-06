export default class EvaluationStat {
  constructor(evaluation) {
    this._evaluation = evaluation;
    this._zeroCount = 0;
    this._pozitiveCount = 0;
    this._sum = 0;
    this._init();
  }

  _init() {
    if (!Array.isArray(this._evaluation)) return;
    this._zeroCount = this._evaluation.filter(ev => ev.value === 0).length;
    [this._pozitiveCount, this._sum] = this._evaluation.reduce(
      (acc, curr) => {
        if (curr.value > 0) {
          acc[0] += 1;
          acc[1] += curr.value;
        }
        return acc;
      },
      [0, 0]
    );
  }

  get isValid() {
    return this._pozitiveCount + this._zeroCount > 0;
  }

  get isReady() {
    return this._zeroCount === 0;
  }

  get averageText() {
    return this._pozitiveCount
      ? (this._sum / this._pozitiveCount).toFixed(1).replace(".", ",")
      : "-";
  }

  get readinessText() {
    return this._pozitiveCount + this._zeroCount
      ? (
          (this._pozitiveCount * 100) /
          (this._pozitiveCount + this._zeroCount)
        ).toFixed(0) + "%"
      : "-";
  }
}
