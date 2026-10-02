import type { Theme } from '../../themes/themes'
import { casefileStage } from './casefile'
import { feyStage } from './fey'
import { holyStage } from './holy'
import { modernStage } from './modern'
import type { Stage } from './shared'
import { steelStage } from './steel'
import { veilStage } from './veil'

/** One roll animation per theme family. */
export const STAGES: Record<Theme['family'], Stage> = {
  steel: steelStage,
  casefile: casefileStage,
  modern: modernStage,
  fey: feyStage,
  holy: holyStage,
  ghost: veilStage,
}
