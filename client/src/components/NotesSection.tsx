import React, { useState, useEffect } from "react";
import CollapsibleSection from "./CollapsibleSection";
import { notesApi, Note } from "../lib/api";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

interface NotesSectionProps {
    ticker: string;
}

const NotesSection: React.FC<NotesSectionProps> = ({ ticker }) => {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        bullCase: "",
        bearCase: "",
        buyInPrice: "",
        currentStance: "neutral",
    });

    const fetchNotes = async () => {
        try {
            const fetchedNotes = await notesApi.getByTicker(ticker);
            setNotes(fetchedNotes);
        } catch (error) {
            console.error("Failed to fetch notes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [ticker]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await notesApi.create(ticker, {
                bullCase: formData.bullCase,
                bearCase: formData.bearCase,
                buyInPrice: parseFloat(formData.buyInPrice) || 0,
                currentStance: formData.currentStance,
            });
            setFormData({
                bullCase: "",
                bearCase: "",
                buyInPrice: "",
                currentStance: "neutral",
            });
            setIsAdding(false);
            fetchNotes();
        } catch (error) {
            console.error("Failed to create note:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        try {
            await notesApi.delete(id);
            fetchNotes();
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    };

    return (
        <CollapsibleSection title="Research Notes" icon="edit_note">
            <div className="flex flex-col gap-4">
                {/* Add Note Button or Form */}
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="self-start flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add Note
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-surface-dark border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">New Note</h4>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bull Case</label>
                                <textarea
                                    className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none min-h-[100px]"
                                    placeholder="Why this stock could go up..."
                                    value={formData.bullCase}
                                    onChange={(e) => setFormData({ ...formData, bullCase: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bear Case</label>
                                <textarea
                                    className="w-full bg-background-dark border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none min-h-[100px]"
                                    placeholder="Risks and concerns..."
                                    value={formData.bearCase}
                                    onChange={(e) => setFormData({ ...formData, bearCase: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Buy-in Price Target</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        className="w-full bg-background-dark border border-white/10 rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-primary focus:outline-none"
                                        placeholder="0.00"
                                        value={formData.buyInPrice}
                                        onChange={(e) => setFormData({ ...formData, buyInPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Current Stance</label>
                                <select
                                    className="w-full bg-background-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-primary focus:outline-none"
                                    value={formData.currentStance}
                                    onChange={(e) => setFormData({ ...formData, currentStance: e.target.value })}
                                >
                                    <option value="neutral">Neutral</option>
                                    <option value="bullish">Bullish</option>
                                    <option value="bearish">Bearish</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="self-end bg-primary text-background-dark font-bold text-sm px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                            disabled={!formData.bullCase && !formData.bearCase}
                        >
                            Save Note
                        </button>
                    </form>
                )}

                {/* Notes List */}
                {loading ? (
                    <div className="text-gray-500 text-sm text-center py-4">Loading notes...</div>
                ) : notes.length === 0 ? (
                    <div className="text-gray-500 text-sm italic text-center py-4">No notes yet. Be the first to add one!</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {notes.map((note) => (
                            <div key={note.id} className="bg-surface-dark/50 border border-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                            {note.user?.displayName?.charAt(0) || "U"}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-bold">{note.user?.displayName || note.user?.username}</span>
                                            <span className="text-gray-500 text-[10px]">{format(new Date(note.createdAt), "MMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${note.currentStance === 'bullish' ? 'bg-growth/10 text-growth border-growth/20' :
                                                note.currentStance === 'bearish' ? 'bg-loss/10 text-loss border-loss/20' :
                                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {note.currentStance}
                                        </span>
                                        {(user?.id === note.user?.id) && (
                                            <button onClick={() => handleDelete(note.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {note.bullCase && (
                                        <div className="bg-growth/5 rounded-lg p-3 border border-growth/10">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="material-symbols-outlined text-growth text-[16px]">trending_up</span>
                                                <span className="text-growth text-xs font-bold uppercase">Bull Case</span>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">{note.bullCase}</p>
                                        </div>
                                    )}
                                    {note.bearCase && (
                                        <div className="bg-loss/5 rounded-lg p-3 border border-loss/10">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="material-symbols-outlined text-loss text-[16px]">trending_down</span>
                                                <span className="text-loss text-xs font-bold uppercase">Bear Case</span>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">{note.bearCase}</p>
                                        </div>
                                    )}
                                </div>

                                {note.buyInPrice > 0 && (
                                    <div className="mt-3 flex items-center gap-2 text-xs">
                                        <span className="text-gray-500 uppercase font-bold">Target Entry:</span>
                                        <span className="text-white font-bold font-mono">${note.buyInPrice.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
};

export default NotesSection;
