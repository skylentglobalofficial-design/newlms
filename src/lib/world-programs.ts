import { programs, type Program, type ProgramType } from '../data'
import { WORLD_PROGRAM_TYPES, type WorldId } from '../skylent-worlds'

export function programsForWorld(world: WorldId): Program[] {
  const types = WORLD_PROGRAM_TYPES[world]
  if (!types.length) return []
  return programs.filter((program) => types.includes(program.programType))
}

export function programsByType(type: ProgramType): Program[] {
  return programs.filter((program) => program.programType === type)
}
