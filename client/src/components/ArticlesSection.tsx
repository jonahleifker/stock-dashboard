import React, { useState, useEffect } from "react";
import CollapsibleSection from "./CollapsibleSection";
import { articlesApi, Article } from "../lib/api";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

interface ArticlesSectionProps {
    ticker: string;
}

const ArticlesSection: React.FC<ArticlesSectionProps> = ({ ticker }) => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        sourceName: "",
    });

    const fetchArticles = async () => {
        try {
            const fetchedArticles = await articlesApi.getByTicker(ticker);
            setArticles(fetchedArticles);
        } catch (error) {
            console.error("Failed to fetch articles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [ticker]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await articlesApi.create(ticker, {
                title: formData.title,
                url: formData.url,
                sourceName: formData.sourceName || "Unknown Source",
                publishedAt: new Date().toISOString(),
            });
            setFormData({ title: "", url: "", sourceName: "" });
            setIsAdding(false);
            fetchArticles();
        } catch (error) {
            console.error("Failed to add article:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this link?")) return;
        try {
            await articlesApi.delete(id);
            fetchArticles();
        } catch (error) {
            console.error("Failed to delete article:", error);
        }
    };

    return (
        <CollapsibleSection title="News & Articles" icon="newspaper">
            <div className="flex flex-col gap-4">
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="self-start flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_link</span>
                        Add Article
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-surface-dark border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">New Link</h4>
                            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Article Title"
                                className="bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary focus:outline-none"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Source Name (e.g. Bloomberg)"
                                className="bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary focus:outline-none"
                                value={formData.sourceName}
                                onChange={e => setFormData({ ...formData, sourceName: e.target.value })}
                            />
                            <input
                                type="url"
                                placeholder="https://..."
                                className="bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary focus:outline-none md:col-span-2"
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="self-end bg-primary text-background-dark font-bold text-sm px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                            Save Link
                        </button>
                    </form>
                )}

                {loading ? (
                    <div className="text-gray-500 text-sm text-center py-4">Loading articles...</div>
                ) : articles.length === 0 ? (
                    <div className="text-gray-500 text-sm italic text-center py-4">No specific links saved yet.</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {articles.map((article) => (
                            <div key={article.id} className="group relative flex items-center justify-between bg-surface-dark border border-white/5 rounded-lg p-3 hover:bg-surface-dark/80 transition-colors">
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="size-8 flex-shrink-0 bg-white/5 rounded flex items-center justify-center text-gray-400">
                                        <span className="material-symbols-outlined text-[18px]">article</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-white text-sm font-medium truncate group-hover:text-primary transition-colors">{article.title}</span>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                            <span className="font-bold text-gray-400">{article.sourceName}</span>
                                            <span>•</span>
                                            <span>{article.publishedAt ? format(new Date(article.publishedAt), "MMM d, yyyy") : "No Date"}</span>
                                            <span>•</span>
                                            <span>Added by {article.user?.displayName || "User"}</span>
                                        </div>
                                    </div>
                                </a>

                                {(user?.id === article.user?.id) && (
                                    <button onClick={() => handleDelete(article.id)} className="ml-3 p-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
};

export default ArticlesSection;
