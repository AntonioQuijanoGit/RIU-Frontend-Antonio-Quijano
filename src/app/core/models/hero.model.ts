export interface Hero {
  id: number;
  name: string;
  alterEgo?: string;
  powers: string[];
  publisher?: string;
  firstAppearance?: Date;
  description?: string;
  imageUrl?: string;
}
