export interface Deck {
  id: string;
  appearance: Appearance;
  cards?: (Card)[] | null;
  extraCharacters?: (ExtraCharacter)[] | null;
  hero: Hero;
  ruleCards?: (RuleCard)[] | null;
  sidekick: Sidekick;
  version: Number;
}
export interface Appearance {
  borderColour: string;
  cardbackUrl: string;
  highlightColour: string;
  isPNP: boolean;
  patternName: string;
}
export interface Card {
  afterText: string;
  basicText: string;
  boost: number;
  characterName: string;
  duringText: string;
  imageUrl: string;
  immediateText: string;
  quantity: number;
  title: string;
  type: string;
  value: number;
}
export interface ExtraCharacter {
  hero: Hero;
  sidekick: Sidekick;
  id?: number;
  cardIndex?: number;
}
export interface Hero {
  hp: number;
  isRanged: boolean;
  move: number;
  name: string;
  specialAbility: string;
}
export interface Sidekick {
  hp?: null;
  isRanged: boolean;
  name: string;
  quantity: number;
  quote: string;
}
export interface RuleCard {
  content: string;
  title: string;
  id?: number;
  cardIndex?: number;
  pinned?: boolean;
}
