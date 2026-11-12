export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  year: string;
  image: string;
  imageAlt: string;
  /** `logo` shows a brand mark on a plain tile instead of a cropped photo. */
  visual?: 'photo' | 'logo';
  url?: string;
  /** Omitted when the client's repository is private. */
  github?: string;
}

export interface SkillCategory {
  label: string;
  summary: string;
  items: string[];
}
