
export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  hideAt?: 'sm' | 'md' | 'lg';
}

export interface TableAction {
  action: string;  
  label?: string;  
  icon?: string;     
  visible?: (row: any) => boolean;
}

export interface TableActionEvent {
  action: string; 
  row: any;    
}
