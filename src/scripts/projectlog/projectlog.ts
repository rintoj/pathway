
export interface ProjectlogUIItem {
  selected: boolean;
  open: boolean;
}

export interface Projectlog {
  id: string;
  title: string;
  description?: string;
  status: string;
  ui?: ProjectlogUIItem;
}
