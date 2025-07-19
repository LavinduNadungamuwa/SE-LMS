import React from 'react';
import { FolderItem, FileItem, TreeItem } from '../types';
import { 
  Folder, 
  FolderOpen, 
  File, 
  MoreVertical, 
  Plus, 
  Edit2, 
  Trash2,
  Download
} from 'lucide-react';

interface FolderTreeProps {
  items: FolderItem[];
  onItemClick: (item: TreeItem) => void;
  onToggleExpand: (item: FolderItem) => void;
  onCreateFolder: (parentId: string) => void;
  onRenameItem: (item: TreeItem) => void;
  onDeleteItem: (item: TreeItem) => void;
  selectedItem?: TreeItem;
  level?: number;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  items,
  onItemClick,
  onToggleExpand,
  onCreateFolder,
  onRenameItem,
  onDeleteItem,
  selectedItem,
  level = 0
}) => {
  const [contextMenu, setContextMenu] = React.useState<{
    show: boolean;
    x: number;
    y: number;
    item: TreeItem;
  } | null>(null);

  const handleRightClick = (e: React.MouseEvent, item: TreeItem) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <File className="w-4 h-4 text-blue-500" />;
  };

  const renderItem = (item: TreeItem) => {
    const isSelected = selectedItem?.id === item.id;
    const indentLevel = level * 20;

    if (item.type === 'folder') {
      const folder = item as FolderItem;
      return (
        <div key={item.id}>
          <div
            className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors rounded-lg group ${
              isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            style={{ marginLeft: indentLevel }}
            onClick={() => onItemClick(item)}
            onContextMenu={(e) => handleRightClick(e, item)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(folder);
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {folder.isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <Folder className="w-4 h-4 text-blue-600" />
              )}
            </button>
            
            <span className="flex-1 text-sm font-medium text-gray-700">
              {item.name}
            </span>

            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(item.id);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Create folder"
              >
                <Plus className="w-3 h-3 text-gray-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRightClick(e, item);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <MoreVertical className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>

          {folder.isExpanded && folder.children.length > 0 && (
            <FolderTree
              items={folder.children as FolderItem[]}
              onItemClick={onItemClick}
              onToggleExpand={onToggleExpand}
              onCreateFolder={onCreateFolder}
              onRenameItem={onRenameItem}
              onDeleteItem={onDeleteItem}
              selectedItem={selectedItem}
              level={level + 1}
            />
          )}
        </div>
      );
    } else {
      const file = item as FileItem;
      return (
        <div
          key={item.id}
          className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors rounded-lg group ${
            isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
          style={{ marginLeft: indentLevel + 28 }}
          onClick={() => onItemClick(item)}
          onContextMenu={(e) => handleRightClick(e, item)}
        >
          {getFileIcon(file.name)}
          <span className="ml-2 flex-1 text-sm text-gray-700">{file.name}</span>
          
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
            <span className="text-xs text-gray-500 mr-2">
              {(file.size / 1024).toFixed(1)} KB
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle download
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Download"
            >
              <Download className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="space-y-1">
        {items.map(renderItem)}
      </div>

      {contextMenu && (
        <div
          className="fixed bg-white border shadow-lg rounded-lg py-2 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              onRenameItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span>Rename</span>
          </button>
          <button
            onClick={() => {
              onDeleteItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </>
  );
};