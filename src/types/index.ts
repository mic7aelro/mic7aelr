export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  year: string;
  image: string;
  imageAlt: string;
  url?: string;
  /** Omitted when the client's repository is private. */
  github?: string;
}

export interface SkillCategory {
  label: string;
  summary: string;
  items: string[];
}
