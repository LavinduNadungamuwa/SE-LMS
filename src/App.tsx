import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Upload, 
  FolderPlus,
  Home,
  User,
  Settings
} from 'lucide-react';
import { FolderTree } from './components/FolderTree';
import { FileUpload } from './components/FileUpload';
import { CreateFolderModal } from './components/CreateFolderModal';
import { FolderItem, FileItem, TreeItem } from './types';
import { loadFromStorage, saveToStorage, generateId } from './utils/storage';

function App() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TreeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [currentParentId, setCurrentParentId] = useState<string>('');
  const [itemToRename, setItemToRename] = useState<TreeItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadedFolders = loadFromStorage();
    setFolders(loadedFolders);
  }, []);

  useEffect(() => {
    saveToStorage(folders);
  }, [folders]);

  const findItemById = (items: (FolderItem | FileItem)[], id: string): TreeItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.type === 'folder') {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateItemInTree = (
    items: (FolderItem | FileItem)[],
    targetId: string,
    updater: (item: TreeItem) => TreeItem
  ): (FolderItem | FileItem)[] => {
    return items.map(item => {
      if (item.id === targetId) {
        return updater(item) as FolderItem | FileItem;
      }
      if (item.type === 'folder') {
        return {
          ...item,
          children: updateItemInTree(item.children, targetId, updater)
        };
      }
      return item;
    });
  };

  const addItemToFolder = (
    items: (FolderItem | FileItem)[],
    parentId: string,
    newItem: FolderItem | FileItem
  ): (FolderItem | FileItem)[] => {
    return items.map(item => {
      if (item.id === parentId && item.type === 'folder') {
        return {
          ...item,
          children: [...item.children, newItem]
        };
      }
      if (item.type === 'folder') {
        return {
          ...item,
          children: addItemToFolder(item.children, parentId, newItem)
        };
      }
      return item;
    });
  };

  const removeItemFromTree = (
    items: (FolderItem | FileItem)[],
    targetId: string
  ): (FolderItem | FileItem)[] => {
    return items
      .filter(item => item.id !== targetId)
      .map(item => {
        if (item.type === 'folder') {
          return {
            ...item,
            children: removeItemFromTree(item.children, targetId)
          };
        }
        return item;
      });
  };

  const handleToggleExpand = (folder: FolderItem) => {
    setFolders(prev =>
      updateItemInTree(prev, folder.id, item => ({
        ...item,
        isExpanded: !(item as FolderItem).isExpanded
      })) as FolderItem[]
    );
  };

  const handleCreateFolder = (parentId: string) => {
    setCurrentParentId(parentId);
    setIsCreateFolderModalOpen(true);
  };

  const handleFolderCreate = (name: string) => {
    const newFolder: FolderItem = {
      id: generateId(),
      name,
      type: 'folder',
      children: [],
      isExpanded: false
    };

    if (currentParentId) {
      setFolders(prev => addItemToFolder(prev, currentParentId, newFolder) as FolderItem[]);
    } else {
      setFolders(prev => [...prev, newFolder]);
    }
  };

  const handleRenameItem = (item: TreeItem) => {
    setItemToRename(item);
    setIsRenameModalOpen(true);
  };

  const handleRename = (newName: string) => {
    if (itemToRename) {
      setFolders(prev =>
        updateItemInTree(prev, itemToRename.id, item => ({
          ...item,
          name: newName
        })) as FolderItem[]
      );
    }
  };

  const handleDeleteItem = (item: TreeItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      setFolders(prev => removeItemFromTree(prev, item.id) as FolderItem[]);
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (!selectedItem || selectedItem.type !== 'folder') {
      alert('Please select a folder to upload files to.');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newFiles: FileItem[] = files.map(file => ({
        id: generateId(),
        name: file.name,
        type: 'file',
        size: file.size,
        uploadDate: new Date().toISOString(),
        fileType: file.type || 'application/octet-stream'
      }));

      setFolders(prev => {
        const updated = newFiles.reduce((acc, file) => 
          addItemToFolder(acc, selectedItem.id, file), prev
        );
        return updated as FolderItem[];
      });

      setIsUploading(false);
      setIsUploadModalOpen(false);
    }, 2000);
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Software Engineering LMS
                  </h1>
                  <p className="text-sm text-gray-500">Learning Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <button
                onClick={() => setIsCreateFolderModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Folder</span>
              </button>
              
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Dashboard</span>
                </div>
                
                <nav className="space-y-2">
                  <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">My Files</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Settings</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Folder Tree */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Organized by academic year and subjects
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {filteredFolders.length > 0 ? (
                      <FolderTree
                        items={filteredFolders}
                        onItemClick={setSelectedItem}
                        onToggleExpand={handleToggleExpand}
                        onCreateFolder={handleCreateFolder}
                        onRenameItem={handleRenameItem}
                        onDeleteItem={handleDeleteItem}
                        selectedItem={selectedItem}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No folders found. Create your first folder to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Panel */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6 h-fit">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                  
                  {selectedItem ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Name</p>
                        <p className="text-sm text-gray-900 mt-1">{selectedItem.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Type</p>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{selectedItem.type}</p>
                      </div>

                      {selectedItem.type === 'file' && (
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Size</p>
                            <p className="text-sm text-gray-900 mt-1">
                              {((selectedItem as FileItem).size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload Date</p>
                            <p className="text-sm text-gray-900 mt-1">
                              {new Date((selectedItem as FileItem).uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </>
                      )}

                      {selectedItem.type === 'folder' && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Items</p>
                          <p className="text-sm text-gray-900 mt-1">
                            {(selectedItem as FolderItem).children.length} items
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">Select an item to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500 transform rotate-45" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedItem && selectedItem.type === 'folder' ? (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Uploading to: <span className="font-medium">{selectedItem.name}</span>
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Please select a folder first to upload files.
                  </p>
                </div>
              )}
              
              <FileUpload 
                onUpload={handleFileUpload} 
                isUploading={isUploading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => {
          setIsCreateFolderModalOpen(false);
          setCurrentParentId('');
        }}
        onSubmit={handleFolderCreate}
        title="Create New Folder"
      />

      {/* Rename Modal */}
      <CreateFolderModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setItemToRename(null);
        }}
        onSubmit={handleRename}
        title="Rename Item"
        defaultValue={itemToRename?.name || ''}
      />
    </div>
  );
}

export default App;