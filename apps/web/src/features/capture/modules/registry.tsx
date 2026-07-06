import type { ModuleProps } from '../types.js';
import { A1Module, A3Module, A4Module, A6Module, A7Module } from './channelA.js';
import { B1Module, B2Module, B3Module, B4Module, B5Module, B6Module, B8Module } from './channelB.js';
import { ConsentModule, PortfolioFactsModule, PortfolioInterpretiveModule, ResumeModule } from './portfolio.js';

export interface ModuleMeta {
  Component: (p: ModuleProps) => JSX.Element;
  chip: string;
  tone: 'a' | 'b' | 'n';
}

/** module_code → its component + display metadata. */
export const MODULE_REGISTRY: Record<string, ModuleMeta> = {
  consent: { Component: ConsentModule, chip: 'Getting started', tone: 'n' },
  portfolio_facts: { Component: PortfolioFactsModule, chip: 'Portfolio · upload point 1', tone: 'n' },
  a1: { Component: A1Module, chip: 'A · stated', tone: 'a' },
  b3: { Component: B3Module, chip: 'B · behavioural', tone: 'b' },
  b4: { Component: B4Module, chip: 'B · behavioural', tone: 'b' },
  b1: { Component: B1Module, chip: 'B · behavioural · runs first', tone: 'b' },
  a3: { Component: A3Module, chip: 'A · stated · after behaviour', tone: 'a' },
  b2: { Component: B2Module, chip: 'B · behavioural', tone: 'b' },
  a4: { Component: A4Module, chip: 'A · stated', tone: 'a' },
  b8: { Component: B8Module, chip: 'B · behavioural', tone: 'b' },
  b5: { Component: B5Module, chip: 'B · behavioural · runs first', tone: 'b' },
  a7: { Component: A7Module, chip: 'A · stated · after wish-sort', tone: 'a' },
  b6: { Component: B6Module, chip: 'B · behavioural · upload', tone: 'b' },
  a6: { Component: A6Module, chip: 'A · stated', tone: 'a' },
  portfolio_interpretive: { Component: PortfolioInterpretiveModule, chip: 'Portfolio · interpretive', tone: 'n' },
  resume: { Component: ResumeModule, chip: 'Resume · upload point 2 · last', tone: 'n' },
};
