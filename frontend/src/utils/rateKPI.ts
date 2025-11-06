  export function rateKPI(value: number, goal: number, type: string): boolean {
    if (type === "BINARY") return value == goal;
    if (type === "HIGHER_BETTER_SUM" || type === "HIGHER_BETTER_PCT") return value >= goal;
    if (type === "LOWER_BETTER_SUM" || type === "LOWER_BETTER_PCT") return value <= goal;
    return false;
  }