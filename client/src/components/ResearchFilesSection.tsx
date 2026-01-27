import React, { useState, useEffect, useCallback } from "react";
import CollapsibleSection from "./CollapsibleSection";
import { filesApi, ResearchFile } from "../lib/api";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { Badge } from "./ui/badge";

interface ResearchFilesSectionProps {
    ticker: string;
}

// Helper to get file icon based on file type
const getFileIcon = (fileType: string): string => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word') || type.includes('doc')) return 'description';
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) return 'table_chart';
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return 'image';
    if (type.includes('text') || type.includes('markdown')) return 'article';
    return 'insert_drive_file';
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const ResearchFilesSection: React.FC<ResearchFilesSectionProps> = ({ ticker }) => {
    const { user } = useAuth();
    const [files, setFiles] = useState<ResearchFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = useCallback(async () => {
        try {
            const fetchedFiles = await filesApi.getByTicker(ticker);
            setFiles(fetchedFiles);
        } catch (err) {
            console.error("Failed to fetch files:", err);
            setError("Failed to load files");
        } finally {
            setLoading(false);
        }
    }, [ticker]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            await filesApi.upload(ticker, file);
            fetchFiles();
        } catch (err: any) {
            console.error("Failed to upload file:", err);
            setError(err.response?.data?.error || "Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
        // Reset input
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDownload = async (file: ResearchFile) => {
        setDownloadingId(file.id);
        try {
            const downloadUrl = await filesApi.getDownloadUrl(file.id);
            window.open(downloadUrl, '_blank');
        } catch (err) {
            console.error("Failed to get download URL:", err);
            setError("Failed to download file");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await filesApi.delete(id);
            fetchFiles();
        } catch (err) {
            console.error("Failed to delete file:", err);
            setError("Failed to delete file");
        }
    };

    return (
        <CollapsibleSection title="Research Files" icon="folder_open">
            <div className="flex flex-col gap-4">
                {/* Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
                        isDragOver 
                            ? 'border-primary bg-primary/5' 
                            : 'border-white/10 hover:border-white/20'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        onChange={handleInputChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg"
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                        {uploading ? (
                            <>
                                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-white">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-3xl text-primary">
                                    cloud_upload
                                </span>
                                <p className="text-sm text-white font-medium">
                                    Drop a file here or click to upload
                                </p>
                                <p className="text-xs text-text-secondary">
                                    PDF, Word, Excel, CSV, Images (max 50MB)
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Files List */}
                {loading ? (
                    <div className="text-gray-500 text-sm text-center py-4">Loading files...</div>
                ) : files.length === 0 ? (
                    <div className="text-gray-500 text-sm italic text-center py-4">
                        No research files yet. Upload documents, reports, or analysis files.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {files.map((file) => (
                            <div 
                                key={file.id} 
                                className="flex items-center gap-4 p-3 bg-surface-dark/50 border border-white/5 rounded-xl hover:bg-surface-dark transition-colors group"
                            >
                                {/* File Icon */}
                                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">
                                        {getFileIcon(file.fileType)}
                                    </span>
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-white truncate">
                                            {file.filename}
                                        </p>
                                        {file.source === 'manus' && (
                                            <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shrink-0">
                                                AI
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                                        <span>{formatFileSize(file.fileSize)}</span>
                                        <span>•</span>
                                        <span>{format(new Date(file.uploadedAt), "MMM d, yyyy")}</span>
                                        <span>•</span>
                                        <span className={user?.id === file.user?.id ? 'text-text-secondary' : 'text-blue-400 font-medium'}>
                                            {file.user?.displayName || file.user?.username}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDownload(file)}
                                        disabled={downloadingId === file.id}
                                        className="p-2 text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                                        title="Download"
                                    >
                                        {downloadingId === file.id ? (
                                            <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                        )}
                                    </button>
                                    
                                    {user?.id === file.user?.id && (
                                        <button
                                            onClick={() => handleDelete(file.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
};

export default ResearchFilesSection;
