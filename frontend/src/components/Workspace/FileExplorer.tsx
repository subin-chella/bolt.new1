import React from 'react';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { File } from '../../types';

interface FileExplorerProps {
  files: File[];
  onFileSelect?: (file: File) => void;
}

const FileItem = ({ file, onFileSelect }: { file: File; onFileSelect?: (file: File) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => {
    if (file.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onFileSelect?.(file);
    }
  };

  return (
    <div className="select-none">
      <div 
        className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-700 rounded cursor-pointer"
        onClick={handleClick}
      >
        {file.type === 'folder' && (
          isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
        {file.type === 'folder' ? (
          <Folder className="w-4 h-4 text-blue-400" />
        ) : (
          <FileText className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-sm">{file.name}</span>
      </div>
      
      {file.type === 'folder' && isOpen && file.children && (
        <div className="ml-4">
          {file.children.map((child) => (
            <FileItem key={child.id} file={child} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  return (
    <div className="h-full bg-gray-800 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Files</h2>
      <div className="space-y-1">
        {files.map((file) => (
          <FileItem key={file.id} file={file} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
}