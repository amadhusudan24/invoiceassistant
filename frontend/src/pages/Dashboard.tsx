import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';
import InvoiceTable from '../components/InvoiceTable';
import UploadModal from '../components/UploadModal';

const Dashboard: React.FC = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/invoices');
            setInvoices(res.data);
        } catch (err) {
            if ((err as any).response?.status === 401) {
                handleLogout();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleInvoiceUploaded = (newInvoice: any) => {
        // If it already exists in the list (e.g processing state), replace it, otherwise add
        setInvoices((prev) => {
            const exists = prev.find(inv => inv.id === newInvoice.id);
            if (exists) {
                return prev.map(inv => inv.id === newInvoice.id ? newInvoice : inv);
            }
            return [...prev, newInvoice];
        });
        // refresh list to be safe
        fetchInvoices();
    };

    const handleInvoiceUpdated = (updatedInvoice: any) => {
        setInvoices((prev) => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                <FileSpreadsheet className="text-indigo-400" size={24} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                                Invoice Portal
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Invoices</h1>
                        <p className="text-neutral-400">Manage and extract data from your uploaded invoices.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5"
                    >
                        <Plus size={18} />
                        Upload Invoice
                    </button>
                </div>

                <InvoiceTable invoices={invoices} onUpdate={handleInvoiceUpdated} />
            </main>

            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleInvoiceUploaded}
            />
        </div>
    );
};

export default Dashboard;
