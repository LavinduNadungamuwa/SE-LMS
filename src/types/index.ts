export interface FileItem {
  id: string;
  name: string;
  type: 'file';
  size: number;
  uploadDate: string;
  fileType: string;
}

export interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  children: (FileItem | FolderItem)[];
  isExpanded?: boolean;
}

export type TreeItem = FileItem | FolderItem;

export interface ContextMenuData {
  x: number;
  y: number;
  item: TreeItem;
  parentId?: string;
}