import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
    const [tickers, setTickers] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (tickerList: string) => {
            const response = await axios.post('/api/stocks/bulk', { tickers: tickerList });
            return response.data;
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['stocks'] });
            // Force refetch to ensure UI updates immediately
            await queryClient.refetchQueries({ queryKey: ['stocks'] });

            setTickers('');
            onClose();
            // In a real app we'd show a toast here with data.message
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1a2119] border border-[#2d372a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-[#2d372a] flex justify-between items-center bg-[#232b22]">
                    <h2 className="text-xl font-bold text-white">Bulk Import Tickers</h2>
                    <button onClick={onClose} className="text-[#a5b6a0] hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-[#a5b6a0] text-sm mb-4">
                        Paste a list of tickers separated by commas, spaces, or newlines.
                        Example: <span className="text-white font-mono">AAPL MSFT GOOGL</span>
                    </p>

                    <textarea
                        className="w-full h-40 bg-[#131712] border border-[#2d372a] rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-primary resize-none"
                        placeholder="AAPL, MSFT, TSLA..."
                        value={tickers}
                        onChange={(e) => setTickers(e.target.value)}
                    />

                    {mutation.isError && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
                            Failed to import tickers. Please try again.
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-full text-white font-bold text-sm hover:bg-[#2d372a] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => mutation.mutate(tickers)}
                        disabled={mutation.isPending || !tickers.trim()}
                        className="px-6 py-2 rounded-full bg-primary text-black font-bold text-sm hover:bg-[#45b025] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                Importing...
                            </>
                        ) : (
                            'Import Tickers'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
