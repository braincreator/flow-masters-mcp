import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/utilities/formatDate';
import Link from 'next/link';
import AnimatedLoadingIndicator from '@/components/ui/AnimatedLoadingIndicator'; // Assuming this path

// --- Copied/defined types - consider moving to a shared types file ---
interface ProjectFileMedia {
  id: string;
  filename: string;
  url: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFile {
  id: string; // This is the ID of the ProjectFile entry itself
  project: string; // ID of the project
  file: ProjectFileMedia; // The actual media file details
  uploadedBy?: {
    id: string;
    name?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  category?: string;
}

interface ProjectDetails {
  id: string;
  specificationFiles: Array<{ // For displaying spec files, if needed here (currently not)
    id: string;
    filename: string;
    url: string;
  }>;
  // Add other necessary ProjectDetails fields if used
}
// --- End of types ---

interface FilesTabContentProps {
  projectFiles: ProjectFile[];
  isLoadingFiles: boolean;
  handleUploadFile: (files: File[]) => Promise<void>; // Adjusted for async and File[]
  handleDeleteFile: (fileEntryId: string) => Promise<void>; // Adjusted for async
  deletingFileId: string | null;
  project: ProjectDetails; // Ensure this has at least 'id'
  lang: string;
  t: (key: string, params?: any) => string;
}

// Helper function to format file size
const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) {
    return 'N/A';
  }
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


const FilesTabContent: React.FC<FilesTabContentProps> = ({
  projectFiles,
  isLoadingFiles,
  handleUploadFile, // Expects File[] now
  handleDeleteFile,
  deletingFileId,
  project, // project prop is available
  lang,
  t,
}) => {

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleUploadFile(Array.from(event.target.files));
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <motion.div
      key="files"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {t('filesTab.title')}
        </h3>
        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer transition-colors duration-150 shadow-sm hover:shadow inline-flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {t('filesTab.uploadButton')}
          <input type="file" multiple className="hidden" onChange={onFileChange} />
        </label>
      </div>

      {/* Project Files Section */}
      {isLoadingFiles && !projectFiles.length ? ( // Show main loader only if no files are yet visible
        <div className="flex justify-center items-center py-10">
          <AnimatedLoadingIndicator size="medium" />
        </div>
      ) : projectFiles && projectFiles.length > 0 ? (
        <motion.div 
          layout 
          className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden"
        >
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('filesTab.fileName')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">{t('filesTab.size')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">{t('filesTab.uploadedAt')}</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('filesTab.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              <AnimatePresence mode="popLayout">
                {projectFiles.map((projectFile, index) => (
                  projectFile && projectFile.file && ( // Ensure projectFile and projectFile.file exist
                  <motion.tr
                    layout
                    key={projectFile.id || `file-${index}`} // Fallback key if id is missing
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.3, opacity: {delay: 0.1}} }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, duration: 0.3 }}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${deletingFileId === projectFile.id ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300 rounded-full flex items-center justify-center mr-3">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate" title={projectFile.file.filename}>
                          {projectFile.file.filename}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap hidden md:table-cell">
                      {formatFileSize(projectFile.file.fileSize)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap hidden lg:table-cell">
                      {formatDate(projectFile.createdAt, lang)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <motion.button
                        onClick={() => handleDeleteFile(projectFile.id)}
                        disabled={deletingFileId === projectFile.id || isLoadingFiles}
                        className={`text-xs px-2 py-1 rounded-md transition-colors duration-150 mr-2
                          ${deletingFileId === projectFile.id || isLoadingFiles
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600'
                          }`}
                        whileHover={{ scale: deletingFileId === projectFile.id || isLoadingFiles ? 1 : 1.05 }}
                        whileTap={{ scale: deletingFileId === projectFile.id || isLoadingFiles ? 1 : 0.95 }}
                      >
                        {deletingFileId === projectFile.id ? (
                          <svg className="animate-spin h-3 w-3 text-red-700 dark:text-red-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          t('filesTab.deleteButton')
                        )}
                      </motion.button>
                      <Link
                        href={projectFile.file.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600 px-2 py-1 rounded-md transition-colors duration-150"
                      >
                        {t('filesTab.downloadButton')}
                      </Link>
                    </td>
                  </motion.tr>
                  )
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {isLoadingFiles && projectFiles.length > 0 && ( // Show small loader at bottom if files are already listed
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 flex justify-center items-center">
               <AnimatedLoadingIndicator size="small" />
               <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{t('filesTab.uploadingIndicator')}</span>
            </div>
          )}
        </motion.div>
      ) : ( // No files and not loading
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {t('filesTab.noFilesTitle')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('filesTab.noFilesDescription')}
          </p>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer transition-colors duration-150 shadow-sm hover:shadow inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t('filesTab.uploadButton')}
            <input type="file" multiple className="hidden" onChange={onFileChange} />
          </label>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FilesTabContent;