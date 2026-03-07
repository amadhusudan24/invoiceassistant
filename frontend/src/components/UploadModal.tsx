import React, { useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';
import api from '../services/api';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newInvoice: any) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/invoices/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onSuccess(res.data);
            onClose();
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h3 className="text-xl font-semibold text-white">Upload Invoice</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div
                        className="border-2 border-dashed border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors cursor-pointer bg-black/20"
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            className="hidden"
                            accept="application/pdf,image/png,image/jpeg"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />

                        {file ? (
                            <div className="flex flex-col items-center space-y-2">
                                <FileText className="text-indigo-400" size={40} />
                                <span className="text-neutral-200 font-medium">{file.name}</span>
                                <span className="text-neutral-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="text-neutral-500 mb-3" size={48} />
                                <p className="text-neutral-300 font-medium">Click or drag file to this area to upload</p>
                                <p className="text-neutral-500 text-sm mt-1">Supports PDF, PNG, JPG</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-black/30 border-t border-white/5 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 transition-colors font-medium"
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-white flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                    >
                        {uploading ? 'Processing...' : 'Upload & Extract'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
