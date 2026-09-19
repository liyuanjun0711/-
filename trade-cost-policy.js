(function initTradeCostPolicy(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.TradeCostPolicy = api;
})(typeof window !== "undefined" ? window : globalThis, function createTradeCostPolicy() {
  "use strict";

  const defaults = Object.freeze({
    commissionRate: 0.00025,
    minimumCommissionCny: 5,
    minimumEconomicOrderCny: 1000,
    maxOneWayCostRatio: 0.005,
    maxRoundTripCostRatio: 0.01,
    minimumNetEdgeRatio: 0.01,
    feeCoverageMultiple: 3,
    lotSize: 100
  });

  function positiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  }

  function normalizePolicy(input) {
    const source = input || {};
    return {
      commissionRate: positiveNumber(source.commissionRate, defaults.commissionRate),
      minimumCommissionCny: positiveNumber(source.minimumCommissionCny, defaults.minimumCommissionCny),
      minimumEconomicOrderCny: positiveNumber(source.minimumEconomicOrderCny, defaults.minimumEconomicOrderCny),
      maxOneWayCostRatio: positiveNumber(source.maxOneWayCostRatio, defaults.maxOneWayCostRatio),
      maxRoundTripCostRatio: positiveNumber(source.maxRoundTripCostRatio, defaults.maxRoundTripCostRatio),
      minimumNetEdgeRatio: positiveNumber(source.minimumNetEdgeRatio, defaults.minimumNetEdgeRatio),
      feeCoverageMultiple: positiveNumber(source.feeCoverageMultiple, defaults.feeCoverageMultiple),
      lotSize: positiveNumber(source.lotSize, defaults.lotSize) || defaults.lotSize
    };
  }

  function estimateOrderAmount(order, policyInput) {
    const policy = normalizePolicy(policyInput);
    const explicitAmount = Number(order && order.estimatedAmountCny);
    if (Number.isFinite(explicitAmount) && explicitAmount > 0) return explicitAmount;
    const price = Number(order && order.referencePrice);
    const lots = Number(order && order.lots);
    const lotSize = positiveNumber(order && order.lotSize, policy.lotSize);
    return Number.isFinite(price) && price > 0 && Number.isFinite(lots) && lots > 0
      ? price * lots * lotSize
      : 0;
  }

  function estimateCosts(amountInput, policyInput, sideCountInput) {
    const policy = normalizePolicy(policyInput);
    const amount = Math.max(0, Number(amountInput) || 0);
    const sideCount = Math.max(1, Math.round(Number(sideCountInput) || 1));
    const commissionPerSide = amount > 0
      ? Math.max(policy.minimumCommissionCny, amount * policy.commissionRate)
      : 0;
    const totalCostCny = commissionPerSide * sideCount;
    const costRatio = amount > 0 ? totalCostCny / amount : Infinity;
    return { amount, sideCount, commissionPerSide, totalCostCny, costRatio };
  }

  function assessOrder(orderInput, policyInput) {
    const order = orderInput || {};
    const policy = normalizePolicy(policyInput);
    const sideCount = Number(order.evaluationSides) || (order.side === "buy" ? 2 : 1);
    const amount = estimateOrderAmount(order, policy);
    const costs = estimateCosts(amount, policy, sideCount);
    const hardRiskExit = order.hardRiskExit === true;
    const expectedGrossEdgeRatio = Number(order.expectedGrossEdgeRatio);
    const hasExpectedGrossEdge = Number.isFinite(expectedGrossEdgeRatio) && expectedGrossEdgeRatio >= 0;
    const ratioLimit = sideCount > 1 ? policy.maxRoundTripCostRatio : policy.maxOneWayCostRatio;
    const belowEconomicMinimum = amount > 0 && amount < policy.minimumEconomicOrderCny;
    const excessiveCostRatio = costs.costRatio > ratioLimit;
    const requiredGrossEdgeRatio = Number.isFinite(costs.costRatio)
      ? Math.max(
          policy.minimumNetEdgeRatio + costs.costRatio,
          policy.feeCoverageMultiple * costs.costRatio
        )
      : Infinity;
    const missingExpectedEdge = order.side === "buy" && !hasExpectedGrossEdge;
    const insufficientExpectedEdge = order.side === "buy" && hasExpectedGrossEdge && expectedGrossEdgeRatio < requiredGrossEdgeRatio;

    let status = "可评估";
    let reason = "订单通过最低成交金额与费用占比闸门。";
    if (!amount) {
      status = "缺少金额";
      reason = "先用真实价格和实际手数计算成交金额。";
    } else if (hardRiskExit) {
      status = "风险退出例外";
      reason = "费用不阻止硬性退出，但同一标的应尽量一次完成，避免拆成多笔最低佣金。";
    } else if (missingExpectedEdge) {
      status = "缺少收益空间";
      reason = "新买入必须先给出可核验的预期毛收益率，再与往返费用比较。";
    } else if (insufficientExpectedEdge) {
      status = "收益不足";
      reason = "预期毛收益不足以覆盖费用闸门，不下单。";
    } else if (belowEconomicMinimum || excessiveCostRatio) {
      status = "暂缓小单";
      reason = "非硬性退出不下碎片单；合并到经济金额或等待更明确的风险信号。";
    }

    return {
      ...costs,
      status,
      reason,
      hardRiskExit,
      belowEconomicMinimum,
      excessiveCostRatio,
      requiredGrossEdgeRatio,
      expectedGrossEdgeRatio: hasExpectedGrossEdge ? expectedGrossEdgeRatio : null,
      missingExpectedEdge,
      insufficientExpectedEdge
    };
  }

  return Object.freeze({ defaults, normalizePolicy, estimateOrderAmount, estimateCosts, assessOrder });
});
