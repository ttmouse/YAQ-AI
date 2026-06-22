# Task: Metric Configuration Update

## Goal
Update the metric card configuration system to match the comprehensive document specification.

## Key Changes
1. Update baseMetrics with ALL metrics from document tables
2. Fix period naming: display "截至目前" not "时点"
3. Each metric gets full fields (指标性质, unit, drillDown, actions)
4. Proper supportPeriods per metric matching spec
5. Dashboard cards show "统计口径" info
6. Panel period filter uses "截至目前" not "时点"

## Success Criteria
- [ ] All ~30+ metrics from document exist in baseMetrics
- [ ] Period filter shows "截至目前" not "时点"
- [ ] Cards show "统计口径" line
- [ ] Period support rules per metric match spec
