// app/editor/types/undoRedo.ts
export type ActionType = 
  | 'color-change'
  | 'text-change'
  | 'font-size-change' 
  | 'position-change'
  | 'size-change'
  | 'element-add'
  | 'element-delete'
  | 'style-change'
  | 'general';

export interface UndoRedoConfig {
  actionType: ActionType;
  description?: string;
}
