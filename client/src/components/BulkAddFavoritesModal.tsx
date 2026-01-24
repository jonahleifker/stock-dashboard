import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../lib/api';

interface BulkAddFavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BulkAddFavoritesModal: React.FC<BulkAddFavoritesModalProps> = ({ isOpen, onClose }) => {
    const [tickers, setTickers] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (tickerList: string[]) => {
            return await favoritesApi.addBulk(tickerList);
        },
        onSuccess: async (data: any) => {
            await queryClient.invalidateQueries({ queryKey: ['favorites'] });

            setTickers('');
            onClose();
        },
        onError: (error: any) => {
            // Keep modal open on error so user can correct input
            console.error(error);
        }
    });

    const handleSubmit = () => {
        if (!tickers.trim()) return;

        // Split by commas, newlines, or spaces
        const tickerList = tickers
            .split(/[\n,\s]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0);

        if (tickerList.length === 0) return;

        mutation.mutate(tickerList);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1a2119] border border-[#2d372a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[#2d372a] flex justify-between items-center bg-[#232b22]">
                    <h2 className="text-xl font-bold text-white">Bulk Add Favorites</h2>
                    <button onClick={onClose} className="text-[#a5b6a0] hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-[#a5b6a0] text-sm mb-4">
                        Paste a list of tickers to add to your favorites. Separated by commas, spaces, or newlines.
                        <br />
                        <span className="text-xs text-text-secondary mt-1 block">Example: AAPL, MSFT, NVDA</span>
                    </p>

                    <textarea
                        className="w-full h-40 bg-[#131712] border border-[#2d372a] rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-primary resize-none placeholder-text-secondary"
                        placeholder="AAPL, MSFT, TSLA..."
                        value={tickers}
                        onChange={(e) => setTickers(e.target.value)}
                        autoFocus
                    />

                    {mutation.isError && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
                            {(mutation.error as any)?.response?.data?.error || "Failed to add favorites. Please try again."}
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
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !tickers.trim()}
                        className="px-6 py-2 rounded-full bg-primary text-black font-bold text-sm hover:bg-[#45b025] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                Adding...
                            </>
                        ) : (
                            'Add Favorites'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkAddFavoritesModal;
