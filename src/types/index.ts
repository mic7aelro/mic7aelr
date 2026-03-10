export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  year: string;
  url?: string;
  github?: string;
}

export interface SkillCategory {
  label: string;
  items: string[];
}
