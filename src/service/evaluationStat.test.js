import EvaluationStat from "./evaluationStat";

describe("EvaluationStat", () => {
  test("üres lista esetén minden érték alapértelmezett", () => {
    const stat = new EvaluationStat([]);
    expect(stat.isValid).toBe(false);
    expect(stat.isReady).toBe(false);
    expect(stat.hasNoRequired).toBe(false);
    expect(stat.averageText).toBe("-");
    expect(stat.readinessText).toBe("-");
  });

  test("csak 0 érték esetén helyesen számol", () => {
    const stat = new EvaluationStat([
      { criterion_id: 1, value: 0, required: true },
      { criterion_id: 2, value: 0, required: true },
    ]);
    expect(stat.isValid).toBe(true);
    expect(stat.isReady).toBe(false);
    expect(stat.hasNoRequired).toBe(false);
    expect(stat.averageText).toBe("-");
    expect(stat.readinessText).toBe("0%");
  });

  test("pozitív és 0 értékek együtt", () => {
    const stat = new EvaluationStat([
      { criterion_id: 1, value: 0, required: true },
      { criterion_id: 2, value: 2, required: true },
      { criterion_id: 3, value: 4, required: true },
    ]);
    expect(stat.isValid).toBe(true);
    expect(stat.isReady).toBe(false);
    expect(stat.hasNoRequired).toBe(false);
    expect(stat.averageText).toBe("3,0"); // (2+4)/2
    expect(stat.readinessText).toBe("67%"); // 2/3 * 100
  });

  test("csak pozitív értékek esetén kész", () => {
    const stat = new EvaluationStat([
      { criterion_id: 1, value: 1, required: true },
      { criterion_id: 2, value: 3, required: false },
      { criterion_id: 3, value: 5, required: true },
    ]);
    expect(stat.isValid).toBe(true);
    expect(stat.isReady).toBe(true);
    expect(stat.hasNoRequired).toBe(true);
    expect(stat.averageText).toBe("3,0"); // (1+3+5)/3
    expect(stat.readinessText).toBe("100%");
  });

  test("null input esetén ne omoljon össze", () => {
    const stat = new EvaluationStat(null);
    expect(stat.isValid).toBe(false);
    expect(stat.isReady).toBe(false);
    expect(stat.hasNoRequired).toBe(false);
    expect(stat.averageText).toBe("-");
    expect(stat.readinessText).toBe("-");
  });
});
