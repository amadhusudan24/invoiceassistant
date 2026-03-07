import React, { useState } from 'react';
import { Pencil, Save, X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';

interface Invoice {
    id: number;
    vendorName: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    taxAmount: number;
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    originalFileName: string;
}

interface InvoiceTableProps {
    invoices: Invoice[];
    onUpdate: (updated: Invoice) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [editRowId, setEditRowId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Invoice>>({});

    const handleEditClick = (invoice: Invoice) => {
        setEditRowId(invoice.id);
        setEditFormData({ ...invoice });
    };

    const handleCancelClick = () => {
        setEditRowId(null);
        setEditFormData({});
    };

    const handleSaveClick = async (id: number) => {
        try {
            const res = await api.put(`/invoices/${id}`, editFormData);
            onUpdate(res.data);
            setEditRowId(null);
        } catch (err) {
            alert('Failed to update invoice');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Invoice) => {
        setEditFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch =
            (inv.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
        const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={12} /> Completed</span>;
            case 'FAILED':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle size={12} /> Failed</span>;
            case 'PROCESSING':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={12} /> Processing</span>;
            default:
                return <span>{status}</span>;
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                <input
                    type="text"
                    placeholder="Search vendor or invoice #..."
                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white w-full sm:max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white w-full sm:w-auto"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="FAILED">Failed</option>
                </select>
            </div>

            <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 border-b border-white/5 text-neutral-400 text-sm font-medium">
                                <th className="p-4 whitespace-nowrap">File Name</th>
                                <th className="p-4">Vendor</th>
                                <th className="p-4">Invoice #</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Tax</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-neutral-200">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-neutral-500">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 text-neutral-400 truncate max-w-[150px]" title={inv.originalFileName}>
                                            {inv.originalFileName}
                                        </td>

                                        {editRowId === inv.id ? (
                                            <>
                                                <td className="p-2"><input className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white" value={editFormData.vendorName || ''} onChange={(e) => handleChange(e, 'vendorName')} /></td>
                                                <td className="p-2"><input className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white" value={editFormData.invoiceNumber || ''} onChange={(e) => handleChange(e, 'invoiceNumber')} /></td>
                                                <td className="p-2"><input type="date" className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white" value={editFormData.invoiceDate || ''} onChange={(e) => handleChange(e, 'invoiceDate')} /></td>
                                                <td className="p-2"><input type="number" className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white" value={editFormData.totalAmount || ''} onChange={(e) => handleChange(e, 'totalAmount')} /></td>
                                                <td className="p-2"><input type="number" className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white" value={editFormData.taxAmount || ''} onChange={(e) => handleChange(e, 'taxAmount')} /></td>
                                                <td className="p-4">{getStatusBadge(inv.status)}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => handleSaveClick(inv.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-md transition-colors"><Save size={16} /></button>
                                                    <button onClick={handleCancelClick} className="p-1.5 bg-neutral-500/20 text-neutral-400 hover:bg-neutral-500/30 rounded-md transition-colors"><X size={16} /></button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4 font-medium">{inv.vendorName || '-'}</td>
                                                <td className="p-4">{inv.invoiceNumber || '-'}</td>
                                                <td className="p-4">{inv.invoiceDate || '-'}</td>
                                                <td className="p-4">{inv.totalAmount ? `$${inv.totalAmount.toFixed(2)}` : '-'}</td>
                                                <td className="p-4">{inv.taxAmount ? `$${inv.taxAmount.toFixed(2)}` : '-'}</td>
                                                <td className="p-4">{getStatusBadge(inv.status)}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleEditClick(inv)}
                                                        className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all"
                                                        title="Edit manually"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTable;
